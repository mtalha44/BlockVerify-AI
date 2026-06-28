// backend/src/services/certificate/certificateBatchService.js
// Update the importExcel function - specifically the blockchain call part

import fs from "fs";
import Certificate from "../../models/Certificate.js";
import excelParser from "../excel/excelParser.js";
import sha256Service from "../hash/sha256Service.js";
import blockchainConfig from "../../config/blockchain.js";
import { createMerkleTreeFromStudents } from "../blockchain/merkleService.js";

class CertificateBatchService {
  /**
   * Import certificates from Excel file
   */
  async importExcel(file, user) {
    try {
      // -----------------------------
      // 1. Validate File
      // -----------------------------
      if (!file || !file.path) {
        throw new Error("No file provided");
      }

      excelParser.validateFile(file);

      // -----------------------------
      // 2. Parse Excel
      // -----------------------------
      const parsed = excelParser.parse(file.path, user.institution);

      if (parsed.students.length === 0) {
        const errorMsg =
          parsed.errors.length > 0
            ? `No valid records found. ${parsed.errors.length} errors.`
            : "No valid student records found.";
        throw new Error(errorMsg);
      }

      console.log(
        `📊 Parsed ${parsed.students.length} valid records, ${parsed.errors.length} errors`,
      );

      // -----------------------------
      // 3. Generate SHA256 Hash for each student
      // -----------------------------
      const students = parsed.students.map((student) => {
        const hash = sha256Service.generate(student);
        return {
          ...student,
          hash,
        };
      });

      console.log(`🔑 Generated ${students.length} hashes`);

      // -----------------------------
      // 4. Build Merkle Tree
      // -----------------------------
      const tree = createMerkleTreeFromStudents(students);
      const merkleRoot = tree.getRoot();

      console.log(`🌳 Merkle Root: ${merkleRoot}`);

      // -----------------------------
      // 5. Store Merkle Root on Blockchain
      // -----------------------------
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      // Prepare metadata
      const metadata = JSON.stringify({
        university: user.institution,
        universityId: user.universityId || user.id,
        totalStudents: students.length,
        uploadedAt: new Date().toISOString(),
        issuer: user.email || user.id,
      });

      // FIX: Call with correct parameter order: (bytes32, string, uint256)
      console.log(`📤 Sending transaction with:`);
      console.log(`   merkleRoot: ${merkleRoot}`);
      console.log(`   metadata length: ${metadata.length}`);
      console.log(`   studentCount: ${students.length}`);

      const tx = await contract.storeMerkleBatch(
        merkleRoot,
        metadata,
        students.length,
      );

      console.log(`📤 Transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Confirmed: ${receipt.blockNumber}`);

      const batchId = tx.hash;

      // -----------------------------
      // 6. Save Certificates to Database
      // -----------------------------
      const savedCertificates = [];
      const savedErrors = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const proof = tree.getProof(i);

        try {
          const certificate = await Certificate.create({
            certificateHash: student.hash,
            studentName: student.studentName,
            fatherName: student.fatherName || "",
            registrationNumber: student.registrationNumber,
            rollNumber: student.rollNumber || "",
            degree: student.degree,
            universityName:
              student.universityName || user.institution || "Unknown",
            session: student.session || "",
            cgpa: student.cgpa || "",
            universityId: user.universityId || user.id,
            issuer: user.institution || "Unknown",
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            status: "verified",
            merkleRoot: merkleRoot,
            merkleProof: proof,
            leafIndex: i,
            batchId: batchId,
            batchLeafCount: students.length,
            batchTransactionHash: tx.hash,
            isBatchCertificate: true,
          });

          savedCertificates.push({
            studentName: certificate.studentName,
            registrationNumber: certificate.registrationNumber,
            certificateHash: certificate.certificateHash,
          });
        } catch (error) {
          savedErrors.push({
            studentName: student.studentName,
            registrationNumber: student.registrationNumber,
            error: error.message,
          });
        }
      }

      console.log(
        `💾 Saved ${savedCertificates.length} certificates, ${savedErrors.length} errors`,
      );

      // -----------------------------
      // 7. Delete Uploaded Excel
      // -----------------------------
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn("File cleanup warning:", cleanupError.message);
        }
      }

      // -----------------------------
      // 8. Response
      // -----------------------------
      return {
        success: true,
        message: `${savedCertificates.length} of ${students.length} certificates imported successfully.`,
        totalRecords: students.length,
        savedCount: savedCertificates.length,
        errorCount: savedErrors.length,
        parseErrors: parsed.errors,
        saveErrors: savedErrors,
        merkleRoot,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        leafCount: students.length,
        batchId,
        certificates: savedCertificates,
      };
    } catch (error) {
      // Cleanup file on error
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn("File cleanup warning:", cleanupError.message);
        }
      }
      throw error;
    }
  }
}

export default new CertificateBatchService();
