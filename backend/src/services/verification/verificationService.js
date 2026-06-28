// backend/src/services/verification/verificationService.js
import Certificate from "../../models/Certificate.js";
import blockchainConfig from "../../config/blockchain.js";
import { createMerkleTreeFromStudents } from "../blockchain/merkleService.js";

class VerificationService {
  /**
   * Verify certificate by hash
   */
  async verifyCertificate(hash) {
    try {
      // Check database
      const certificate = await Certificate.findOne({ certificateHash: hash });
      if (!certificate) {
        return {
          valid: false,
          message: "Certificate not found in database",
        };
      }

      // Check blockchain
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      const result = await contract.verifyCertificate(hash);

      return {
        valid: result.isValid,
        certificate,
        blockchain: result,
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
