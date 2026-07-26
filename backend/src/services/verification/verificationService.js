import Certificate from "../../models/Certificate.js";
import blockchainConfig from "../../config/blockchain.js";
import sha256Service from "../hash/sha256Service.js";

class VerificationService {
  /* Verify certificate by hash - supports both single and batch  */
  async verifyCertificate(hash) {
    try {
      // Check MongoDB first
      const certificate = await Certificate.findOne({ certificateHash: hash });

      if (!certificate) {
        return {
          valid: false,
          exists: false,
          message: "Certificate not found in database",
        };
      }

      // Check if revoked
      if (certificate.status === "revoked") {
        return {
          valid: false,
          exists: true,
          isRevoked: true,
          message: "Certificate has been revoked",
          revocationReason: certificate.revocationReason,
          revokedAt: certificate.revokedAt,
          revokedBy: certificate.revokedBy,
          certificate,
        };
      }

      // Verify on blockchain
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      let blockchainValid = false;
      let verificationMethod = "unknown";
      let blockchainDetails = null;

      if (certificate.isBatchCertificate && certificate.merkleRoot) {
        // Batch certificate - verify Merkle proof
        try {
          const proofValid = await contract.verifyMerkleProof(
            hash,
            certificate.merkleProof,
            certificate.merkleRoot,
          );

          if (proofValid) {
            const batchInfo = await contract.verifyMerkleBatch(
              certificate.merkleRoot,
            );
            blockchainValid = batchInfo.exists && batchInfo.isValid;
            verificationMethod = "merkle";
            blockchainDetails = {
              merkleRoot: certificate.merkleRoot,
              batchId: certificate.batchId,
              leafIndex: certificate.leafIndex,
              batchSize: certificate.batchLeafCount,
              isValid: batchInfo.isValid,
              issuer: batchInfo.issuer,
            };
          } else {
            console.log("❌ Merkle proof verification failed");
          }
        } catch (merkleError) {
          console.error("Merkle verification error:", merkleError.message);
          // Fallback to single verification
          try {
            const result = await contract.verifyCertificate(hash);
            blockchainValid = result.exists && !result.isRevoked;
            verificationMethod = "single-fallback";
            blockchainDetails = result;
          } catch (fallbackError) {
            console.error(
              "Fallback verification failed:",
              fallbackError.message,
            );
          }
        }
      } else {
        // Single certificate - direct verification
        try {
          const result = await contract.verifyCertificate(hash);
          blockchainValid = result.exists && !result.isRevoked;
          verificationMethod = "single";
          blockchainDetails = result;
        } catch (error) {
          console.error("Blockchain verification error:", error.message);
          // Fallback to database status
          blockchainValid = certificate.status === "verified";
          verificationMethod = "database-fallback";
        }
      }

      const isValid = blockchainValid && certificate.status === "verified";

      return {
        valid: isValid,
        exists: true,
        isRevoked: certificate.status === "revoked",
        verificationMethod,
        blockchain: blockchainDetails,
        certificate,
        message: isValid
          ? "Certificate verified successfully"
          : "Certificate verification failed",
      };
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  /* Verify certificate from OCR data */
  async verifyFromOCR(ocrData) {
    try {
      // Generate hash from OCR data
      const hash = sha256Service.generate({
        studentName: ocrData.student_name,
        fatherName: ocrData.father_name,
        registrationNumber: ocrData.registration_number,
        rollNumber: ocrData.roll_number,
        degree: ocrData.degree,
        session: ocrData.session,
        cgpa: ocrData.cgpa,
        universityName: ocrData.university_name,
      });

      return await this.verifyCertificate(hash);
    } catch (error) {
      throw new Error(`OCR verification failed: ${error.message}`);
    }
  }

  /* Verify Merkle proof for batch certificate */
  async verifyMerkleProof(certificate) {
    try {
      if (
        !certificate.merkleRoot ||
        !certificate.merkleProof ||
        certificate.leafIndex === null
      ) {
        return {
          valid: false,
          message: "Certificate is not part of a batch",
        };
      }

      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      // Verify proof
      const proofValid = await contract.verifyMerkleProof(
        certificate.certificateHash,
        certificate.merkleProof,
        certificate.merkleRoot,
      );

      if (proofValid) {
        // Get batch info
        const batchInfo = await contract.verifyMerkleBatch(
          certificate.merkleRoot,
        );
        return {
          valid: true,
          batchInfo: {
            exists: batchInfo.exists,
            isValid: batchInfo.isValid,
            issuer: batchInfo.issuer,
            certificateCount: batchInfo.certificateCount,
            timestamp: batchInfo.timestamp,
          },
        };
      }

      return {
        valid: false,
        message: "Invalid Merkle proof",
      };
    } catch (error) {
      throw new Error(`Merkle proof verification failed: ${error.message}`);
    }
  }

  /* Get full batch by merkle root */
  async getBatchByMerkleRoot(merkleRoot) {
    const certificates = await Certificate.find({ merkleRoot })
      .sort({ leafIndex: 1 })
      .select(
        "studentName registrationNumber degree certificateHash leafIndex status",
      );

    // Verify batch on blockchain
    try {
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();
      const batchInfo = await contract.verifyMerkleBatch(merkleRoot);

      return {
        total: certificates.length,
        certificates,
        merkleRoot,
        blockchainInfo: {
          exists: batchInfo.exists,
          isValid: batchInfo.isValid,
          issuer: batchInfo.issuer,
          certificateCount: batchInfo.certificateCount,
          timestamp: batchInfo.timestamp,
        },
      };
    } catch (error) {
      return {
        total: certificates.length,
        certificates,
        merkleRoot,
        blockchainInfo: {
          error: "Blockchain verification failed",
        },
      };
    }
  }
}

export default new VerificationService();
