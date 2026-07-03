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
// BULK UPLOAD CERTIFICATES
// ============================================================
export const bulkUploadCertificates = async (req, res) => {
  try {
    const { files } = req;
    const universityId = req.user?.universityId || req.user?.id;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    console.log(`📁 Processing ${files.length} certificates in bulk...`);

    const concurrencyLimit = 5;
    const results = [];
    const errors = [];

    const processFile = async (file) => {
      const fileResult = {
        filename: file.originalname,
        success: false,
        error: null,
        data: null,
      };

      try {
        if (!fs.existsSync(file.path)) {
          throw new Error("File not found on disk");
        }

        // Step 1: OCR
        const ocrResult = await easyOCRService.extractFields(file.path);
        if (!ocrResult.success) {
          throw new Error(ocrResult.error || "OCR failed");
        }

        const fields = ocrResult.fields;

        // Step 2: Prepare data - ONLY 7 FIELDS
        const certificateData = {
          student_name: fields.student_name || "Unknown",
          father_name: fields.father_name || "",
          registration_number:
            fields.registration_number || `REG-${Date.now()}`,
          roll_number: fields.roll_number || "",
          degree: fields.degree || "Not Specified",
          session: fields.session || "",
          cgpa: fields.cgpa || "",
        };

        // Step 3: Generate Hash using sha256Service
        const certificateHash = sha256Service.generate(certificateData);

        // Step 4: Store on Blockchain
        await blockchainConfig.initialize();
        const contract = blockchainConfig.getContract();

        const metadata = JSON.stringify({
          registrationNumber: certificateData.registration_number,
          studentName: certificateData.student_name,
          degree: certificateData.degree,
          session: certificateData.session,
          cgpa: certificateData.cgpa,
          university: req.user?.institution || "Unknown",
          universityId: universityId,
        });

        const tx = await contract.storeCertificate(certificateHash, metadata);
        const receipt = await tx.wait();

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
          universityName: req.user?.institution || "Unknown",
          universityId,
          issuer: req.user?.institution || "Unknown",
          issueDate: new Date(),
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          status: "verified",
          ocrData: fields,
          confidence: ocrResult.confidence || 0,
          processingTime: ocrResult.processingTime || 0,
        });

        fileResult.success = true;
        fileResult.data = {
          studentName: certificateData.student_name,
          registrationNumber: certificateData.registration_number,
          degree: certificateData.degree,
          certificateHash: certificateHash,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return fileResult;
      } catch (error) {
        console.error(
          `❌ Error processing ${file.originalname}:`,
          error.message,
        );
        fileResult.error = error.message;

        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}
        }

        return fileResult;
      }
    };

    const fileQueue = [...files];
    while (fileQueue.length > 0) {
      const batch = fileQueue.splice(0, concurrencyLimit);
      const batchPromises = batch.map((file) => processFile(file));
      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach((result) => {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({
            file: result.filename,
            error: result.error,
          });
        }
      });

      console.log(
        `📊 Progress: ${results.length + errors.length}/${files.length}`,
      );
    }

    console.log(
      `✅ Bulk upload complete: ${results.length} success, ${errors.length} errors`,
    );

    res.status(200).json({
      success: true,
      message: `Processed ${results.length} certificates successfully`,
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);

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
    });
  }
};

// ============================================================
// VERIFY CERTIFICATE BY HASH
// ============================================================
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
