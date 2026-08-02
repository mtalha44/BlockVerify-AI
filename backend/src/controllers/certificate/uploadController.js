import Certificate from "../../models/Certificate.js";
import easyOCRService from "../../services/ocr/easyOcrService.js";
import blockchainConfig from "../../config/blockchain.js";
import sha256Service from "../../services/hash/sha256Service.js";
import { createMerkleTreeFromStudents } from "../../services/blockchain/merkleService.js";
import fs from "fs";

// OCR ONLY - For user verification flow
export const uploadCertificateForVerification = async (req, res) => {
  try {
    const { file } = req;
    const userId = req.user?.id;

    console.log("📄 Upload request received:");
    console.log("File:", file ? file.originalname : "No file");
    console.log("User:", userId);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(400).json({
        success: false,
        message: "File upload failed. Please try again.",
      });
    }

    console.log(`📄 Processing certificate: ${file.originalname}`);
    console.log(`📄 File path: ${file.path}`);
    console.log(`📄 File size: ${(file.size / 1024).toFixed(2)} KB`);

    // REAL OCR PROCESSING
    console.log("🔍 Running OCR via EasyOCR service...");

    const ocrResult = await easyOCRService.extractFields(file.path);

    // Clean up file immediately after OCR
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Cleaned up: ${file.path}`);
      }
    } catch (cleanupError) {
      console.warn("File cleanup warning:", cleanupError.message);
    }

    if (!ocrResult.success) {
      console.error("❌ OCR failed:", ocrResult.error);
      return res.status(400).json({
        success: false,
        message: ocrResult.error || "OCR processing failed. Please try again.",
      });
    }

    const fields = ocrResult.fields;
    console.log("📊 Extracted fields:", fields);
    console.log(`⏱️ Processing time: ${ocrResult.processingTime}s`);

    // Return ONLY the 7 fields
    res.status(200).json({
      success: true,
      message: "OCR completed successfully",
      data: {
        student_name: fields.student_name || "",
        father_name: fields.father_name || "",
        registration_number: fields.registration_number || "",
        roll_number: fields.roll_number || "",
        degree: fields.degree || "",
        session: fields.session || "",
        cgpa: fields.cgpa || "",
      },
      confidence: ocrResult.confidence || 85,
      processingTime: ocrResult.processingTime || 0,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);

    // Cleanup file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Cleaned up on error: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn("File cleanup warning:", cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process certificate",
    });
  }
};

// ============================================================
// SINGLE CERTIFICATE UPLOAD - OCR + BLOCKCHAIN STORAGE
// ============================================================
export const uploadSingleCertificate = async (req, res) => {
  try {
    const { file } = req;
    const universityId = req.user?.universityId || req.user?.id;
    const user = req.user;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(400).json({
        success: false,
        message: "File upload failed. Please try again.",
      });
    }

    console.log(`📄 Processing certificate: ${file.originalname}`);
    console.log(`📄 File path: ${file.path}`);
    console.log(`📄 File size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`👤 University ID: ${universityId}`);

    // Step 1: OCR Processing
    console.log("🔍 Running OCR...");
    const ocrResult = await easyOCRService.extractFields(file.path);

    if (!ocrResult.success) {
      throw new Error(ocrResult.error || "OCR processing failed");
    }

    const fields = ocrResult.fields;
    console.log("📊 Extracted fields:", fields);

    // Step 2: Prepare certificate data
    const certificateData = {
      student_name: fields.student_name || "Unknown",
      father_name: fields.father_name || "",
      registration_number: fields.registration_number || `REG-${Date.now()}`,
      roll_number: fields.roll_number || "",
      degree: fields.degree || "Not Specified",
      session: fields.session || "",
      cgpa: fields.cgpa || "",
    };

    console.log("📝 Certificate data for hash:", certificateData);

    // Step 3: Generate Hash using sha256Service
    const certificateHash = sha256Service.generate(certificateData);
    console.log(`🔑 Hash: ${certificateHash}`);

    // Step 4: Store on Blockchain
    console.log("⛓️ Storing on blockchain...");
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    const metadata = JSON.stringify({
      registrationNumber: certificateData.registration_number,
      studentName: certificateData.student_name,
      degree: certificateData.degree,
      session: certificateData.session,
      cgpa: certificateData.cgpa,
      university: user?.institution || "Unknown",
      universityId: universityId,
      uploadedBy: user?.email || user?.id || "Unknown",
      timestamp: new Date().toISOString(),
    });

    console.log(`📤 Sending transaction to store certificate...`);
    console.log(`   Hash: ${certificateHash}`);
    console.log(`   Metadata: ${metadata.substring(0, 100)}...`);

    const tx = await contract.storeCertificate(certificateHash, metadata);
    console.log(`📤 Tx sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Confirmed: ${receipt.blockNumber}`);
    console.log(`✅ Gas used: ${receipt.gasUsed.toString()}`);

    // Step 5: Save to Database
    const certificate = await Certificate.create({
      certificateHash,
      studentName: certificateData.student_name,
      fatherName: certificateData.father_name,
      registrationNumber: certificateData.registration_number,
      rollNumber: certificateData.roll_number,
      degree: certificateData.degree,
      session: certificateData.session,
      cgpa: certificateData.cgpa,
      universityName: user?.institution || "Unknown",
      universityId: universityId,
      issuer: user?.institution || "Unknown",
      issueDate: new Date(),
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: "verified",
      ocrData: fields,
      confidence: ocrResult.confidence || 0,
      processingTime: ocrResult.processingTime || 0,
    });

    console.log(`💾 Certificate saved to database with ID: ${certificate._id}`);

    // Step 6: Cleanup file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Cleaned up: ${file.path}`);
      }
    } catch (cleanupError) {
      console.warn("File cleanup warning:", cleanupError.message);
    }

    // Step 7: Response
    const responseData = {
      success: true,
      message: "Certificate uploaded and stored on blockchain successfully",
      data: {
        student_name: certificateData.student_name,
        father_name: certificateData.father_name,
        registration_number: certificateData.registration_number,
        roll_number: certificateData.roll_number,
        degree: certificateData.degree,
        session: certificateData.session,
        cgpa: certificateData.cgpa,
        status: "verified",
        certificateHash: certificateHash,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        processingTime: ocrResult.processingTime,
        confidence: ocrResult.confidence,
      },
    };

    console.log("✅ Upload complete, sending response");
    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Upload error:", error);
    console.error("Error stack:", error.stack);

    // Cleanup file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Cleaned up on error: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn("File cleanup warning:", cleanupError.message);
      }
    }

    // Check for specific blockchain errors
    let errorMessage = error.message || "Failed to process certificate";
    if (
      error.code === "ACTION_REJECTED" ||
      error.message?.includes("user rejected")
    ) {
      errorMessage = "Transaction was rejected. Please confirm in your wallet.";
    } else if (error.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds in wallet to pay gas fees.";
    } else if (error.message?.includes("already exists")) {
      errorMessage = "This certificate already exists on the blockchain.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

// ============================================================
// BULK UPLOAD CERTIFICATES WITH MERKLE TREE
// ============================================================
export const bulkUploadCertificates = async (req, res) => {
  try {
    const { files } = req;
    const universityId = req.user?.universityId || req.user?.id;
    const user = req.user;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    console.log(
      `📁 Processing ${files.length} certificates with Merkle Tree...`,
    );
    console.log(`👤 University ID: ${universityId}`);
    console.log(`⏱️ Estimated time: ~${files.length * 15} seconds`);

    const startTime = Date.now();
    const students = [];
    const errors = [];
    const duplicateHashes = new Set();

    // PROCESSING ALL FILES SEQUENTIALLY (OCR + HASH)
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📄 PHASE 1: OCR Processing (${files.length} files)`);
    console.log(`${"=".repeat(60)}`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const currentFileNumber = i + 1;

      console.log(
        `\n🔄 [${currentFileNumber}/${files.length}] Processing: ${file.originalname}`,
      );

      try {
        // Validate file
        if (!fs.existsSync(file.path)) {
          throw new Error("File not found on disk");
        }

        // OCR Processing
        console.log(`🔍 Running OCR...`);
        const ocrResult = await easyOCRService.extractFields(file.path);

        // Cleanup file immediately after OCR
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        if (!ocrResult.success) {
          throw new Error(ocrResult.error || "OCR processing failed");
        }

        const fields = ocrResult.fields;
        console.log(`✅ OCR complete (${ocrResult.processingTime}s)`);
        console.log(`📊 Fields:`, fields);

        // Prepare certificate data
        const studentData = {
          studentName: fields.student_name || "Unknown",
          fatherName: fields.father_name || "",
          registrationNumber:
            fields.registration_number ||
            `REG-${Date.now()}-${String(i + 1).padStart(3, "0")}`,
          rollNumber: fields.roll_number || "",
          degree: fields.degree || "Not Specified",
          session: fields.session || "",
          cgpa: fields.cgpa || "",
        };

        // Generate Hash
        const certificateHash = sha256Service.generate(studentData);
        console.log(`🔑 Hash: ${certificateHash.substring(0, 16)}...`);

        // Check for duplicates
        const existingCertificate = await Certificate.findOne({
          certificateHash,
        });
        if (existingCertificate) {
          console.log(
            `⚠️ Duplicate detected: ${certificateHash.substring(
              0,
              16,
            )}... (skipping)`,
          );
          duplicateHashes.add(certificateHash);
          errors.push({
            file: file.originalname,
            error: "Certificate already exists (duplicate)",
            registrationNumber: studentData.registrationNumber,
          });
          continue;
        }

        // Store student data with hash
        students.push({
          ...studentData,
          hash: certificateHash,
          ocrData: fields,
          confidence: ocrResult.confidence || 0,
          processingTime: ocrResult.processingTime || 0,
          filename: file.originalname,
        });

        console.log(
          `✅ [${currentFileNumber}/${files.length}] Processed successfully`,
        );
      } catch (error) {
        console.error(
          `❌ [${currentFileNumber}/${files.length}] Failed:`,
          error.message,
        );
        errors.push({
          file: file.originalname,
          error: error.message,
        });

        // Cleanup file on error
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}
        }
      }

      // Progress report
      const processed = students.length + errors.length;
      console.log(
        `📊 Progress: ${processed}/${files.length} (${Math.round(
          (processed / files.length) * 100,
        )}%)`,
      );
    }

    // Checking if we have any valid students
    if (students.length === 0) {
      console.log(`❌ No valid certificates to store`);
      return res.status(400).json({
        success: false,
        message: "No valid certificates found. All files failed processing.",
        summary: {
          total: files.length,
          successful: 0,
          failed: errors.length,
          duplicate: duplicateHashes.size,
        },
        errors,
      });
    }

    // STEP 2: BUILD MERKLE TREE
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `🌳 PHASE 2: Building Merkle Tree (${students.length} certificates)`,
    );
    console.log(`${"=".repeat(60)}`);

    const tree = createMerkleTreeFromStudents(students);
    const merkleRoot = tree.getRoot();
    console.log(`✅ Merkle Root: ${merkleRoot}`);

    // STEP 3: STORING MERKLE ROOT ON BLOCKCHAIN (ONE TRANSACTION)
    console.log(`\n${"=".repeat(60)}`);
    console.log(`⛓️ PHASE 3: Blockchain Storage (ONE transaction)`);
    console.log(`${"=".repeat(60)}`);

    const blockchainStartTime = Date.now();

    try {
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      const metadata = JSON.stringify({
        university: user?.institution || "Unknown",
        universityId: universityId,
        totalStudents: students.length,
        uploadedBy: user?.email || user?.id || "Unknown",
        timestamp: new Date().toISOString(),
        certificateData: students.map((s) => ({
          name: s.studentName,
          registration: s.registrationNumber,
          degree: s.degree,
        })),
      });

      console.log(`📤 Storing Merkle Root on blockchain...`);
      console.log(`   merkleRoot: ${merkleRoot}`);
      console.log(`   studentCount: ${students.length}`);

      const tx = await contract.storeMerkleBatch(
        merkleRoot,
        metadata,
        students.length,
      );
      console.log(`📤 Tx sent: ${tx.hash}`);

      const receipt = await tx.wait();
      const blockchainTime = (Date.now() - blockchainStartTime) / 1000;
      console.log(`✅ Confirmed: ${receipt.blockNumber} (${blockchainTime}s)`);

      // STEP 4: SAVE ALL CERTIFICATES TO DATABASE
      console.log(`\n${"=".repeat(60)}`);
      console.log(
        `💾 PHASE 4: Database Storage (${students.length} certificates)`,
      );
      console.log(`${"=".repeat(60)}`);

      const savedCertificates = [];
      const saveErrors = [];

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
            session: student.session || "",
            cgpa: student.cgpa || "",
            universityName: user?.institution || "Unknown",
            universityId: universityId,
            issuer: user?.institution || "Unknown",
            issueDate: new Date(),
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            status: "verified",
            ocrData: student.ocrData,
            confidence: student.confidence || 0,
            processingTime: student.processingTime || 0,
            merkleRoot: merkleRoot,
            merkleProof: proof,
            leafIndex: i,
            batchId: receipt.hash,
            batchLeafCount: students.length,
            batchTransactionHash: receipt.hash,
            isBatchCertificate: true,
          });

          savedCertificates.push({
            studentName: certificate.studentName,
            registrationNumber: certificate.registrationNumber,
            certificateHash: certificate.certificateHash,
            leafIndex: i,
          });

          console.log(
            `✅ [${i + 1}/${students.length}] Saved: ${student.studentName}`,
          );
        } catch (error) {
          console.error(
            `❌ [${i + 1}/${students.length}] Save failed:`,
            error.message,
          );
          saveErrors.push({
            studentName: student.studentName,
            registrationNumber: student.registrationNumber,
            error: error.message,
          });
        }
      }

      // STEP 5: FINAL SUMMARY
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n${"=".repeat(60)}`);
      console.log(`✅ BULK UPLOAD COMPLETE (Merkle Tree)`);
      console.log(`${"=".repeat(60)}`);
      console.log(`📊 Total Files: ${files.length}`);
      console.log(`✅ Successful OCR: ${students.length}`);
      console.log(`💾 Saved to DB: ${savedCertificates.length}`);
      console.log(`❌ Failed: ${errors.length + saveErrors.length}`);
      console.log(`🔄 Duplicates Skipped: ${duplicateHashes.size}`);
      console.log(`⛓️ Blockchain Tx: 1 (instead of ${students.length})`);
      console.log(`⏱️ Total Time: ${totalTime}s`);
      console.log(
        `📈 Avg Time/File: ${(totalTime / files.length).toFixed(2)}s`,
      );
      console.log(`${"=".repeat(60)}`);

      res.status(200).json({
        success: true,
        message: `Processed ${savedCertificates.length} of ${students.length} certificates successfully`,
        summary: {
          totalFiles: files.length,
          totalProcessed: students.length,
          savedToDatabase: savedCertificates.length,
          failed: errors.length + saveErrors.length,
          duplicatesSkipped: duplicateHashes.size,
          merkleRoot: merkleRoot,
          blockNumber: receipt.blockNumber,
          transactionHash: receipt.hash,
          totalTime: `${totalTime}s`,
          blockchainTime: `${blockchainTime}s`,
          avgTimePerFile: `${(totalTime / files.length).toFixed(2)}s`,
        },
        results: savedCertificates,
        errors: [
          ...errors.map((e) => ({
            file: e.file,
            error: e.error,
          })),
          ...saveErrors.map((e) => ({
            student: e.studentName,
            registration: e.registrationNumber,
            error: e.error,
          })),
        ],
      });
    } catch (blockchainError) {
      console.error("❌ Blockchain storage failed:", blockchainError.message);

      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}
        }
      });

      res.status(500).json({
        success: false,
        message: `Blockchain storage failed: ${blockchainError.message}`,
        error: blockchainError.message,
        studentsProcessed: students.length,
      });
    }
  } catch (error) {
    console.error("❌ Bulk upload error:", error);

    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}
        }
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process bulk upload",
      error: error.message,
    });
  }
};
