import blockchainConfig from "../../config/blockchain.js";
import Certificate from "../../models/Certificate.js";
import BatchJob from "../../models/BatchJob.js";

class TransactionService {
  async storeCertificate(hash, canonicalData, universityId, batchId = null) {
    try {
      const contract = blockchainConfig.getContract();

      const result = await blockchainConfig.sendTransaction(
        contract.storeCertificate,
        hash,
        canonicalData,
      );

      if (result.success) {
        // Save to database
        const certificateData = {
          ...canonicalData,
          hash,
          universityId,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          status: "completed",
        };

        if (batchId) {
          certificateData.batchId = batchId;
          certificateData.isBatchProcessed = true;
        }

        const certificate = new Certificate(certificateData);
        await certificate.save();

        if (batchId) {
          await BatchJob.findOneAndUpdate(
            { batchId },
            {
              $inc: { successfulCertificates: 1 },
              $push: {
                transactions: {
                  certificateHash: hash,
                  transactionHash: result.transactionHash,
                  status: "success",
                  timestamp: new Date(),
                },
              },
            },
          );
        }
      }

      return result;
    } catch (error) {
      console.error("Store certificate failed:", error);
      return { success: false, error: error.message };
    }
  }

  async storeBatchCertificate(hash, batchId, metadata, universityId) {
    try {
      const contract = blockchainConfig.getContract();

      const result = await blockchainConfig.sendTransaction(
        contract.storeBatchCertificate,
        hash,
        batchId,
        metadata,
      );

      if (result.success) {
        await Certificate.create({
          hash,
          batchId,
          universityId,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          status: "completed",
        });
      }

      return result;
    } catch (error) {
      console.error("Store batch certificate failed:", error);
      return { success: false, error: error.message };
    }
  }

  async storeMerkleBatch(
    batchId,
    merkleRoot,
    leaves,
    certificateCount,
    universityId,
  ) {
    try {
      const contract = blockchainConfig.getContract();

      const result = await blockchainConfig.sendTransaction(
        contract.storeMerkleBatch,
        batchId,
        merkleRoot,
        leaves,
        certificateCount,
      );

      if (result.success) {
        await BatchJob.findOneAndUpdate(
          { batchId },
          {
            merkleRoot,
            merkleTransactionHash: result.transactionHash,
            status: "completed",
            endTime: new Date(),
          },
        );
      }

      return result;
    } catch (error) {
      console.error("Store merkle batch failed:", error);
      return { success: false, error: error.message };
    }
  }

  async revokeCertificate(hash, reason, universityId) {
    try {
      const contract = blockchainConfig.getContract();

      const result = await blockchainConfig.sendTransaction(
        contract.revokeCertificate,
        hash,
        reason,
      );

      if (result.success) {
        await Certificate.findOneAndUpdate(
          { hash },
          {
            isRevoked: true,
            revocationReason: reason,
            revokedAt: new Date(),
            status: "revoked",
          },
        );
      }

      return result;
    } catch (error) {
      console.error("Revoke certificate failed:", error);
      return { success: false, error: error.message };
    }
  }

  async revokeBatchCertificate(hash, reason, universityId) {
    try {
      const contract = blockchainConfig.getContract();

      const result = await blockchainConfig.sendTransaction(
        contract.revokeBatchCertificate,
        hash,
        reason,
      );

      if (result.success) {
        await Certificate.findOneAndUpdate(
          { hash },
          {
            isRevoked: true,
            revocationReason: reason,
            revokedAt: new Date(),
            status: "revoked",
          },
        );
      }

      return result;
    } catch (error) {
      console.error("Revoke batch certificate failed:", error);
      return { success: false, error: error.message };
    }
  }

  async getCertificate(hash) {
    try {
      const contract = blockchainConfig.getContract();
      const result = await contract.verifyCertificate(hash);

      return {
        exists: result[0],
        isRevoked: result[1],
        issuer: result[2],
        timestamp: Number(result[3]),
        revocationReason: result[4],
      };
    } catch (error) {
      console.error("Get certificate failed:", error);
      return null;
    }
  }

  async getIssuerStats(address) {
    try {
      const contract = blockchainConfig.getContract();
      const stats = await contract.getIssuerStats(address);

      return {
        totalCertificates: Number(stats[0]),
        activeCertificates: Number(stats[1]),
        revokedCertificates: Number(stats[2]),
        totalTransactions: Number(stats[3]),
      };
    } catch (error) {
      console.error("Get stats failed:", error);
      return null;
    }
  }
}

export default new TransactionService();
