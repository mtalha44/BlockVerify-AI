// backend/src/controllers/certificateController.js
import Certificate from "../models/Certificate.js";
import BatchJob from "../models/BatchJob.js";
import certificateBatchService from "../services/certificate/certificateBatchService.js";
import easyOCRService from "../services/ocr/easyOcrService.js";
import blockchainConfig from "../config/blockchain.js";
import sha256Service from "../services/hash/sha256Service.js";
import fs from "fs";
import xlsx from "xlsx";
import { createMerkleTreeFromStudents } from "../services/blockchain/merkleService.js";
import crypto from "crypto";

// ============================================================
// OCR ONLY - For user verification flow
// ============================================================
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

    // Return ONLY the 7 fields (NO university_name)
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

    // Step 2: Prepare certificate data - ONLY 7 FIELDS
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
// backend/src/controllers/certificateController.js
// ============================================================
// BULK UPLOAD CERTIFICATES - SEQUENTIAL WITH PROGRESS
// ============================================================
// export const bulkUploadCertificates = async (req, res) => {
//   try {
//     const { files } = req;
//     const universityId = req.user?.universityId || req.user?.id;
//     const user = req.user;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No files uploaded",
//       });
//     }

//     console.log(`📁 Processing ${files.length} certificates in bulk (SEQUENTIAL)...`);
//     console.log(`👤 University ID: ${universityId}`);
//     console.log(`⏱️ Estimated time: ~${files.length * 15} seconds`);

//     const startTime = Date.now();
//     const results = [];
//     const errors = [];
//     let processedCount = 0;

//     // ============================================================
//     // PROCESS FILES ONE BY ONE (SEQUENTIAL)
//     // ============================================================
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const currentFileNumber = i + 1;
      
//       console.log(`\n${'='.repeat(60)}`);
//       console.log(`📄 [${currentFileNumber}/${files.length}] Processing: ${file.originalname}`);
//       console.log(`${'='.repeat(60)}`);

//       const fileStartTime = Date.now();
//       const fileResult = {
//         filename: file.originalname,
//         success: false,
//         error: null,
//         data: null,
//         processingTime: 0,
//         steps: {
//           ocr: 0,
//           hash: 0,
//           blockchain: 0,
//           database: 0,
//         }
//       };

//       try {
//         // ============================================================
//         // STEP 1: VALIDATE FILE
//         // ============================================================
//         console.log(`🔍 [${currentFileNumber}/${files.length}] Validating file...`);
//         if (!fs.existsSync(file.path)) {
//           throw new Error("File not found on disk");
//         }
//         console.log(`✅ File validated: ${(file.size / 1024).toFixed(2)} KB`);

//         // ============================================================
//         // STEP 2: OCR PROCESSING
//         // ============================================================
//         console.log(`🔍 [${currentFileNumber}/${files.length}] Running OCR...`);
//         const ocrStartTime = Date.now();
//         const ocrResult = await easyOCRService.extractFields(file.path);
//         fileResult.steps.ocr = (Date.now() - ocrStartTime) / 1000;

//         if (!ocrResult.success) {
//           throw new Error(ocrResult.error || "OCR processing failed");
//         }

//         const fields = ocrResult.fields;
//         console.log(`✅ OCR completed in ${fileResult.steps.ocr}s`);
//         console.log(`📊 Extracted fields:`, fields);

//         // ============================================================
//         // STEP 3: PREPARE CERTIFICATE DATA
//         // ============================================================
//         const certificateData = {
//           student_name: fields.student_name || "Unknown",
//           father_name: fields.father_name || "",
//           registration_number: fields.registration_number || `REG-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
//           roll_number: fields.roll_number || "",
//           degree: fields.degree || "Not Specified",
//           session: fields.session || "",
//           cgpa: fields.cgpa || "",
//         };

//         // ============================================================
//         // STEP 4: GENERATE HASH
//         // ============================================================
//         console.log(`🔑 [${currentFileNumber}/${files.length}] Generating hash...`);
//         const hashStartTime = Date.now();
//         const certificateHash = sha256Service.generate(certificateData);
//         fileResult.steps.hash = (Date.now() - hashStartTime) / 1000;
//         console.log(`✅ Hash generated: ${certificateHash.substring(0, 16)}...`);

//         // ============================================================
//         // STEP 5: STORE ON BLOCKCHAIN
//         // ============================================================
//         console.log(`⛓️ [${currentFileNumber}/${files.length}] Storing on blockchain...`);
//         const blockchainStartTime = Date.now();
//         await blockchainConfig.initialize();
//         const contract = blockchainConfig.getContract();

//         const metadata = JSON.stringify({
//           registrationNumber: certificateData.registration_number,
//           studentName: certificateData.student_name,
//           degree: certificateData.degree,
//           session: certificateData.session,
//           cgpa: certificateData.cgpa,
//           university: user?.institution || "Unknown",
//           universityId: universityId,
//           uploadedBy: user?.email || user?.id || "Unknown",
//           timestamp: new Date().toISOString(),
//         });

//         const tx = await contract.storeCertificate(certificateHash, metadata);
//         const receipt = await tx.wait();
//         fileResult.steps.blockchain = (Date.now() - blockchainStartTime) / 1000;
//         console.log(`✅ Blockchain confirmed: ${receipt.blockNumber} (${fileResult.steps.blockchain}s)`);

//         // ============================================================
//         // STEP 6: SAVE TO DATABASE
//         // ============================================================
//         console.log(`💾 [${currentFileNumber}/${files.length}] Saving to database...`);
//         const dbStartTime = Date.now();
//         const certificate = await Certificate.create({
//           certificateHash,
//           studentName: certificateData.student_name,
//           fatherName: certificateData.father_name,
//           registrationNumber: certificateData.registration_number,
//           rollNumber: certificateData.roll_number,
//           degree: certificateData.degree,
//           session: certificateData.session,
//           cgpa: certificateData.cgpa,
//           universityName: user?.institution || "Unknown",
//           universityId: universityId,
//           issuer: user?.institution || "Unknown",
//           issueDate: new Date(),
//           transactionHash: receipt.hash,
//           blockNumber: receipt.blockNumber,
//           status: "verified",
//           ocrData: fields,
//           confidence: ocrResult.confidence || 0,
//           processingTime: ocrResult.processingTime || 0,
//         });
//         fileResult.steps.database = (Date.now() - dbStartTime) / 1000;
//         console.log(`✅ Database saved: ${certificate._id} (${fileResult.steps.database}s)`);

//         // ============================================================
//         // STEP 7: CLEANUP
//         // ============================================================
//         console.log(`🗑️ [${currentFileNumber}/${files.length}] Cleaning up...`);
//         if (fs.existsSync(file.path)) {
//           fs.unlinkSync(file.path);
//           console.log(`✅ File cleaned up`);
//         }

//         // ============================================================
//         // STEP 8: SUCCESS
//         // ============================================================
//         fileResult.success = true;
//         fileResult.data = {
//           studentName: certificateData.student_name,
//           registrationNumber: certificateData.registration_number,
//           degree: certificateData.degree,
//           certificateHash: certificateHash,
//           transactionHash: receipt.hash,
//           blockNumber: receipt.blockNumber,
//         };
//         fileResult.processingTime = (Date.now() - fileStartTime) / 1000;

//         results.push(fileResult);
//         processedCount++;

//         console.log(`✅ [${currentFileNumber}/${files.length}] COMPLETED in ${fileResult.processingTime}s`);
//         console.log(`   📊 Steps: OCR=${fileResult.steps.ocr}s, Hash=${fileResult.steps.hash}s, Blockchain=${fileResult.steps.blockchain}s, DB=${fileResult.steps.database}s`);

//       } catch (error) {
//         console.error(`❌ [${currentFileNumber}/${files.length}] FAILED:`, error.message);
//         fileResult.error = error.message;
//         fileResult.processingTime = (Date.now() - fileStartTime) / 1000;
//         errors.push(fileResult);

//         // Cleanup file on error
//         if (fs.existsSync(file.path)) {
//           try {
//             fs.unlinkSync(file.path);
//             console.log(`🗑️ Cleaned up failed file: ${file.path}`);
//           } catch (e) {
//             console.warn(`⚠️ Cleanup warning:`, e.message);
//           }
//         }
//       }

//       // ============================================================
//       // PROGRESS REPORT
//       // ============================================================
//       const completed = results.length + errors.length;
//       const percentComplete = Math.round((completed / files.length) * 100);
//       console.log(`\n📊 Progress: ${completed}/${files.length} (${percentComplete}%)`);
//       console.log(`✅ Successful: ${results.length} | ❌ Failed: ${errors.length}`);
      
//       // Small delay between files to let system breathe
//       if (i < files.length - 1) {
//         console.log(`⏳ Waiting 500ms before next file...`);
//         await new Promise(resolve => setTimeout(resolve, 500));
//       }
//     }

//     // ============================================================
//     // FINAL SUMMARY
//     // ============================================================
//     const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
//     const avgTimePerFile = (totalTime / files.length).toFixed(2);

//     console.log(`\n${'='.repeat(60)}`);
//     console.log(`✅ BULK UPLOAD COMPLETE`);
//     console.log(`${'='.repeat(60)}`);
//     console.log(`📊 Total Files: ${files.length}`);
//     console.log(`✅ Successful: ${results.length}`);
//     console.log(`❌ Failed: ${errors.length}`);
//     console.log(`⏱️ Total Time: ${totalTime}s`);
//     console.log(`📈 Avg Time/File: ${avgTimePerFile}s`);
//     console.log(`${'='.repeat(60)}`);

//     res.status(200).json({
//       success: true,
//       message: `Processed ${results.length} of ${files.length} certificates successfully`,
//       summary: {
//         total: files.length,
//         successful: results.length,
//         failed: errors.length,
//         totalTime: `${totalTime}s`,
//         avgTimePerFile: `${avgTimePerFile}s`,
//         totalFilesProcessed: results.length + errors.length,
//       },
//       results: results.map(r => ({
//         filename: r.filename,
//         studentName: r.data?.studentName,
//         registrationNumber: r.data?.registrationNumber,
//         certificateHash: r.data?.certificateHash,
//         transactionHash: r.data?.transactionHash,
//         processingTime: `${r.processingTime}s`,
//         steps: r.steps,
//       })),
//       errors: errors.map(e => ({
//         filename: e.filename,
//         error: e.error,
//         processingTime: `${e.processingTime}s`,
//       })),
//     });

//   } catch (error) {
//     console.error("❌ Bulk upload error:", error);

//     // Cleanup all files on major error
//     if (req.files) {
//       req.files.forEach((file) => {
//         if (fs.existsSync(file.path)) {
//           try {
//             fs.unlinkSync(file.path);
//           } catch (e) {
//             console.warn(`⚠️ Cleanup warning:`, e.message);
//           }
//         }
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to process bulk upload",
//       error: error.message,
//     });
//   }
// };

// ============================================================
// VERIFY CERTIFICATE BY HASH
// ============================================================

// backend/src/controllers/certificateController.js
// Add this new function for bulk upload with Merkle Tree

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
    const duplicateHashes = new Set(); // Track duplicates

    // ============================================================
    // STEP 1: PROCESS ALL FILES SEQUENTIALLY (OCR + HASH)
    // ============================================================
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

        // Prepare certificate data - ONLY 7 FIELDS
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

    // Check if we have any valid students
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

    // ============================================================
    // STEP 2: BUILD MERKLE TREE
    // ============================================================
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `🌳 PHASE 2: Building Merkle Tree (${students.length} certificates)`,
    );
    console.log(`${"=".repeat(60)}`);

    const tree = createMerkleTreeFromStudents(students);
    const merkleRoot = tree.getRoot();
    console.log(`✅ Merkle Root: ${merkleRoot}`);

    // ============================================================
    // STEP 3: STORE MERKLE ROOT ON BLOCKCHAIN (ONE TRANSACTION)
    // ============================================================
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

      // ============================================================
      // STEP 4: SAVE ALL CERTIFICATES TO DATABASE
      // ============================================================
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
            // Merkle Tree fields
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

      // ============================================================
      // STEP 5: FINAL SUMMARY
      // ============================================================
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

      // Cleanup any files that weren't cleaned up
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

    // Cleanup all files on major error
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

export const verifyCertificateByHash = async (req, res) => {
  try {
    const { hash } = req.params || req.body;

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: "Certificate hash is required",
      });
    }

    console.log(`🔍 Verifying certificate: ${hash}`);

    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    const isValid = await contract.verifyCertificate(hash);

    let details = null;
    try {
      details = await contract.getCertificate(hash);
    } catch (detailError) {
      console.log(
        "ℹ️ getCertificate method not available, using basic verification",
      );
    }

    const certificate = await Certificate.findOne({ certificateHash: hash });

    res.status(200).json({
      success: true,
      isValid,
      details: details
        ? {
            registrationNumber: details[0],
            studentName: details[1],
            degree: details[2],
            issueDate: new Date(Number(details[3]) * 1000),
            isValid: details[4],
            ipfsHash: details[5],
          }
        : null,
      certificate: certificate || null,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET BATCH STATUS
// ============================================================
export const getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batchJob = await BatchJob.findOne({ batchId });

    if (!batchJob) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.json({
      success: true,
      batch: batchJob,
    });
  } catch (error) {
    console.error("Batch status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET DASHBOARD STATS
// ============================================================
export const getDashboardStats = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;

    const dbTotal = await Certificate.countDocuments({ universityId });
    const verifiedCount = await Certificate.countDocuments({
      universityId,
      status: "verified",
    });
    const revokedCount = await Certificate.countDocuments({
      universityId,
      status: "revoked",
    });
    const recentTransactions = await Certificate.find({ universityId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "studentName registrationNumber certificateHash transactionHash status createdAt",
      );

    let totalCertificates = 0;
    try {
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      if (contract.getCertificateCount) {
        totalCertificates = Number(await contract.getCertificateCount()) || 0;
      } else {
        totalCertificates = dbTotal;
      }
    } catch (blockchainError) {
      console.warn("⚠️ Blockchain stats not available, using database stats");
      totalCertificates = dbTotal;
    }

    res.json({
      success: true,
      totalWriteTransactions: totalCertificates || dbTotal || 0,
      recordsStored: dbTotal || 0,
      verifiedStudents: verifiedCount || 0,
      revokedCount: revokedCount || 0,
      recentTransactions: recentTransactions || [],
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL CERTIFICATES
// ============================================================
export const getCertificates = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { universityId };
    if (status) filter.status = status;

    const certificates = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Certificate.countDocuments(filter);

    res.status(200).json({
      success: true,
      certificates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// REVOKE CERTIFICATE
// ============================================================
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

// ============================================================
// GET CERTIFICATE BY ID
// ============================================================
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Get certificate error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SEARCH STUDENTS FOR REVOCATION
// ============================================================
export const searchStudentsForRevocation = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(query, "i");

    const certificates = await Certificate.find({
      universityId,
      status: "verified",
      $or: [
        { studentName: searchRegex },
        { registrationNumber: searchRegex },
        { rollNumber: searchRegex },
        { studentId: searchRegex },
      ],
    })
      .limit(20)
      .select(
        "studentName registrationNumber rollNumber certificateHash degree issueDate",
      );

    res.status(200).json({
      success: true,
      students: certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET CERTIFICATE STATS
// ============================================================
export const getCertificateStats = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;

    const stats = await Certificate.aggregate([
      { $match: { universityId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Certificate.countDocuments({ universityId });
    const recentUploads = await Certificate.find({ universityId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total,
        verified: stats.find((s) => s._id === "verified")?.count || 0,
        revoked: stats.find((s) => s._id === "revoked")?.count || 0,
        pending: stats.find((s) => s._id === "pending")?.count || 0,
        failed: stats.find((s) => s._id === "failed")?.count || 0,
      },
      recentUploads,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SEARCH CERTIFICATES
// ============================================================
export const searchCertificates = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query, "i");
    const certificates = await Certificate.find({
      universityId,
      $or: [
        { studentName: searchRegex },
        { registrationNumber: searchRegex },
        { degree: searchRegex },
        { studentId: searchRegex },
        { certificateHash: searchRegex },
      ],
    }).limit(20);

    res.status(200).json({
      success: true,
      certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// BULK IMPORT FROM EXCEL
// ============================================================
export const bulkImportFromExcel = async (req, res) => {
  try {
    const result = await certificateBatchService.importExcel(
      req.file,
      req.user,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Bulk Import Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
