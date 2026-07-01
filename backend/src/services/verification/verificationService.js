// backend/src/services/verification/verificationService.js
import Certificate from "../../models/Certificate.js";
import blockchainConfig from "../../config/blockchain.js";
import { createMerkleTreeFromStudents } from "../blockchain/merkleService.js";

class VerificationService {
  /**
   * Verify certificate by hash
   */
  // backend/src/services/verification/verificationService.js
  // Update verifyCertificate function

  async verifyCertificate(hash) {
    try {
      // Step 1: Check MongoDB first (mutable state)
      const certificate = await Certificate.findOne({ certificateHash: hash });

      if (!certificate) {
        return {
          valid: false,
          message: "Certificate not found in database",
          exists: false,
        };
      }

      // Step 2: Check if revoked in MongoDB
      if (certificate.status === "revoked") {
        return {
          valid: false,
          message: "Certificate has been revoked",
          exists: true,
          revocationReason: certificate.revocationReason,
          revokedAt: certificate.revokedAt,
          revokedBy: certificate.revokedBy,
          certificate,
        };
      }

      // Step 3: Verify on blockchain based on type
      let blockchainValid = false;
      let blockchainDetails = null;

      try {
        await blockchainConfig.initialize();
        const contract = blockchainConfig.getContract();

        if (certificate.isBatchCertificate) {
          // Batch certificate - verify Merkle proof
          if (
            certificate.merkleRoot &&
            certificate.merkleProof &&
            certificate.leafIndex !== null
          ) {
            // Verify Merkle proof
            const isValid = await contract.verifyMerkleProof(
              certificate.certificateHash,
              certificate.merkleProof,
              certificate.merkleRoot,
            );
            blockchainValid = isValid;

            // Get batch info
            try {
              const batchInfo = await contract.verifyMerkleBatch(
                certificate.merkleRoot,
              );
              blockchainDetails = {
                merkleRoot: certificate.merkleRoot,
                batchId: certificate.batchId,
                isValid: batchInfo.isValid,
                certificateCount: batchInfo.certificateCount,
              };
            } catch (e) {
              blockchainDetails = {
                merkleRoot: certificate.merkleRoot,
                batchId: certificate.batchId,
                note: "Batch info not available",
              };
            }
          } else {
            // Batch certificate without proof - fallback to single verification
            const result = await contract.verifyCertificate(
              certificate.certificateHash,
            );
            blockchainValid = result.isValid;
            blockchainDetails = result;
          }
        } else {
          // Single certificate - direct verification
          const result = await contract.verifyCertificate(
            certificate.certificateHash,
          );
          blockchainValid = result.isValid;
          blockchainDetails = result;
        }
      } catch (blockchainError) {
        console.warn(
          `⚠️ Blockchain verification failed: ${blockchainError.message}`,
        );
        // If blockchain is unreachable, fallback to database status
        blockchainValid = certificate.status === "verified";
        blockchainDetails = { note: "Blockchain verification unavailable" };
      }

      return {
        valid: blockchainValid && certificate.status === "verified",
        exists: true,
        isRevoked: certificate.status === "revoked",
        certificate,
        blockchain: blockchainDetails,
      };
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  /**
   * Verify Merkle proof for batch certificate
   */
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

      // Rebuild tree from batch
      const batchCertificates = await Certificate.find({
        merkleRoot: certificate.merkleRoot,
      }).sort({ leafIndex: 1 });

      if (batchCertificates.length === 0) {
        return {
          valid: false,
          message: "Batch not found",
        };
      }

      // Verify on blockchain
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      const isValid = await contract.verifyMerkleBatch(certificate.merkleRoot);

      return {
        valid: isValid,
        batchSize: batchCertificates.length,
        certificate,
      };
    } catch (error) {
      throw new Error(`Merkle proof verification failed: ${error.message}`);
    }
  }

  /**
   * Get full batch by merkle root
   */
  async getBatchByMerkleRoot(merkleRoot) {
    const certificates = await Certificate.find({ merkleRoot })
      .sort({ leafIndex: 1 })
      .select(
        "studentName registrationNumber degree certificateHash leafIndex",
      );

    return {
      total: certificates.length,
      certificates,
      merkleRoot,
    };
  }
}

export default new VerificationService();
