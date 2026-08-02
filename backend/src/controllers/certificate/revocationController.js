import Certificate from "../../models/Certificate.js";
import blockchainConfig from "../../config/blockchain.js";

// REVOKE CERTIFICATE
export const revokeCertificate = async (req, res) => {
  try {
    const { hash } = req.params;
    const { reason } = req.body;
    const revokedBy = req.user?.id || req.user?.email || "unknown";

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: "Certificate hash is required",
      });
    }

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Revocation reason is required (minimum 3 characters)",
      });
    }

    console.log(`🚫 Revoking certificate: ${hash}`);
    console.log(`📝 Reason: ${reason}`);
    console.log(`👤 Revoked by: ${revokedBy}`);

    const certificate = await Certificate.findOne({ certificateHash: hash });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found in database",
      });
    }

    if (certificate.status === "revoked") {
      return res.status(400).json({
        success: false,
        message: "Certificate already revoked",
        data: {
          revokedAt: certificate.revokedAt,
          revocationReason: certificate.revocationReason,
          revokedBy: certificate.revokedBy,
        },
      });
    }

    const isBatchCertificate = certificate.isBatchCertificate === true;
    const blockchainHash = hash.startsWith("0x") ? hash : `0x${hash}`;

    let transactionHash = null;
    let blockNumber = null;
    let revocationType = isBatchCertificate ? "batch" : "single";

    if (isBatchCertificate) {
      console.log(
        `📦 Batch certificate detected. Merkle Root: ${certificate.merkleRoot}`,
      );
      console.log(`📦 Batch ID: ${certificate.batchId}`);
      console.log(`📦 Leaf Index: ${certificate.leafIndex}`);

      try {
        await blockchainConfig.initialize();
        const contract = blockchainConfig.getContract();

        if (contract.logCertificateRevocation) {
          console.log(`📝 Logging revocation audit on blockchain...`);
          const tx = await contract.logCertificateRevocation(
            blockchainHash,
            reason,
            certificate.batchId || certificate.merkleRoot || "unknown",
          );
          transactionHash = tx.hash;
          const receipt = await tx.wait();
          blockNumber = receipt.blockNumber;
          console.log(`✅ Audit log recorded: ${transactionHash}`);
        } else {
          console.log(`ℹ️ Audit log function not available in contract`);
        }
      } catch (auditError) {
        console.warn(`⚠️ Blockchain audit log failed: ${auditError.message}`);
        console.warn(`⚠️ Continuing with database revocation...`);
      }

      const updatedCertificate = await Certificate.findOneAndUpdate(
        { certificateHash: hash },
        {
          status: "revoked",
          revocationReason: reason,
          revokedAt: new Date(),
          revokedBy: revokedBy,
          revocationType: "batch",
          transactionHash: transactionHash || certificate.transactionHash,
          blockNumber: blockNumber || certificate.blockNumber,
        },
        { new: true, returnDocument: "after" },
      );

      return res.status(200).json({
        success: true,
        message: "Certificate revoked successfully (batch certificate)",
        data: {
          certificateHash: hash,
          status: "revoked",
          revocationReason: reason,
          revokedAt: updatedCertificate.revokedAt,
          revokedBy: revokedBy,
          revocationType: "batch",
          isBatchCertificate: true,
          merkleRoot: certificate.merkleRoot,
          batchId: certificate.batchId,
          leafIndex: certificate.leafIndex,
          transactionHash: transactionHash,
          blockNumber: blockNumber,
          certificate: updatedCertificate,
        },
      });
    } else {
      console.log(`📄 Single certificate detected`);

      try {
        await blockchainConfig.initialize();
        const contract = blockchainConfig.getContract();

        const tx = await contract.revokeCertificate(blockchainHash, reason);
        transactionHash = tx.hash;
        const receipt = await tx.wait();
        blockNumber = receipt.blockNumber;
        console.log(`✅ Blockchain revocation confirmed: ${transactionHash}`);

        const updatedCertificate = await Certificate.findOneAndUpdate(
          { certificateHash: hash },
          {
            status: "revoked",
            revocationReason: reason,
            revokedAt: new Date(),
            revokedBy: revokedBy,
            revocationType: "single",
            transactionHash: transactionHash,
            blockNumber: blockNumber,
          },
          { new: true },
        );

        return res.status(200).json({
          success: true,
          message: "Certificate revoked successfully (single certificate)",
          data: {
            certificateHash: hash,
            status: "revoked",
            revocationReason: reason,
            revokedAt: updatedCertificate.revokedAt,
            revokedBy: revokedBy,
            revocationType: "single",
            transactionHash: transactionHash,
            blockNumber: blockNumber,
            certificate: updatedCertificate,
          },
        });
      } catch (blockchainError) {
        console.error(
          `❌ Blockchain revocation failed: ${blockchainError.message}`,
        );
        return res.status(500).json({
          success: false,
          message: `Blockchain revocation failed: ${blockchainError.message}`,
          error: blockchainError.message,
        });
      }
    }
  } catch (error) {
    console.error("Revocation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
