// backend/src/controllers/certificateController.js
import Certificate from "../models/Certificate.js";
import BatchJob from "../models/BatchJob.js";
import easyOCRService from "../services/ocr/easyOcrService.js";
import blockchainConfig from "../config/blockchain.js";
import fs from "fs";
import crypto from "crypto";

// Upload single certificate

// backend/src/controllers/certificateController.js
// Update the uploadSingleCertificate function - remove the certificateExists check

export const uploadSingleCertificate = async (req, res) => {
  try {
    const { file } = req;
    const universityId = req.user?.universityId || req.user?.id;

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
      university_name: fields.university_name || req.user?.institution || "Unknown",
      session: fields.session || "",
      cgpa: fields.cgpa || "",
      status: "verified",
      issuer: req.user?.institution || "Unknown",
      issued_at: new Date().toISOString(),
    };

    // Step 3: Generate Hash
    const certificateHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(certificateData))
      .digest("hex");

    console.log(`🔑 Hash: ${certificateHash.substring(0, 16)}...`);

    // Step 4: Store on Blockchain
    console.log("⛓️ Storing on blockchain...");
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    // IMPORTANT: Remove certificateExists check - it doesn't exist in your contract
    // Instead, try to issue and handle duplicate error if it occurs

const metadata = JSON.stringify({
  registrationNumber: certificateData.registration_number,
  studentName: certificateData.student_name,
  degree: certificateData.degree,
  session: certificateData.session,
  cgpa: certificateData.cgpa,
});

const tx = await contract.storeCertificate("0x" + certificateHash, metadata);

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
      universityName: certificateData.university_name,
      session: certificateData.session,
      cgpa: certificateData.cgpa,
      status: certificateData.status,
      universityId,
      issuer: certificateData.issuer,
      issueDate: new Date(),
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      ocrData: fields,
      confidence: ocrResult.confidence || 0,
      processingTime: ocrResult.processingTime || 0,
    });

    // Step 6: Cleanup
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
      student_name: certificateData.student_name,
      father_name: certificateData.father_name,
      registration_number: certificateData.registration_number,
      roll_number: certificateData.roll_number,
      degree: certificateData.degree,
      university_name: certificateData.university_name,
      session: certificateData.session,
      cgpa: certificateData.cgpa,
      status: certificateData.status,
      certificateHash: certificateHash,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      processingTime: ocrResult.processingTime,
      confidence: ocrResult.confidence,
    };

    res.status(200).json({
      success: true,
      message: "Certificate uploaded and verified successfully",
      data: responseData,
    });

  } catch (error) {
    console.error("Upload error:", error);

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

// Verify certificate by hash
// Update verifyCertificateByHash - remove methods that don't exist
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

    // Check blockchain
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    // Use verifyCertificate (exists in your contract)
    const isValid = await contract.verifyCertificate(hash);
    
    // Try to get details if the method exists
    let details = null;
    try {
      details = await contract.getCertificate(hash);
    } catch (detailError) {
      console.log("ℹ️ getCertificate method not available, using basic verification");
    }

    // Check database
    const certificate = await Certificate.findOne({ certificateHash: hash });

    res.status(200).json({
      success: true,
      isValid,
      details: details ? {
        registrationNumber: details[0],
        studentName: details[1],
        degree: details[2],
        issueDate: new Date(Number(details[3]) * 1000),
        isValid: details[4],
        ipfsHash: details[5],
      } : null,
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

// Get batch status
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

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;

    // Get blockchain stats
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();
    const totalCertificates = await contract.getCertificateCount();

    // Get database stats
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

    res.json({
      success: true,
      totalWriteTransactions: Number(totalCertificates) || 0,
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

// Get all certificates for university
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

// Revoke certificate
// Update revokeCertificate - use the method that exists
export const revokeCertificate = async (req, res) => {
  try {
    const { hash } = req.params;
    const { reason } = req.body;

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: "Certificate hash is required",
      });
    }

    console.log(`🚫 Revoking certificate: ${hash}`);

    // Check if certificate exists in database
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
      });
    }

    // Revoke on blockchain
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    // Use revokeCertificate (exists in your contract)
    const tx = await contract.revokeCertificate(hash);
    await tx.wait();

    // Update database
    await Certificate.findOneAndUpdate(
      { certificateHash: hash },
      {
        status: "revoked",
        revocationReason: reason || "No reason provided",
        revokedAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Certificate revoked successfully",
      transactionHash: tx.hash,
    });
  } catch (error) {
    console.error("Revocation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get certificate by ID
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

// Bulk upload certificates
// backend/src/controllers/certificateController.js
// Optimized bulk upload with parallel processing

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

    // Process files in parallel with concurrency limit
    const concurrencyLimit = 5; // Process 5 files at a time
    const results = [];
    const errors = [];

    // Helper to process a single file
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

        // Step 2: Prepare data
        const certificateData = {
          student_name: fields.student_name || "Unknown",
          father_name: fields.father_name || "",
          registration_number: fields.registration_number || `REG-${Date.now()}`,
          roll_number: fields.roll_number || "",
          degree: fields.degree || "Not Specified",
          university_name: fields.university_name || req.user?.institution || "Unknown",
          session: fields.session || "",
          cgpa: fields.cgpa || "",
          issuer: req.user?.institution || "Unknown",
        };

        // Step 3: Generate Hash
        const certificateHash = crypto
          .createHash("sha256")
          .update(JSON.stringify(certificateData))
          .digest("hex");

        // Step 4: Store on Blockchain
        await blockchainConfig.initialize();
        const contract = blockchainConfig.getContract();

        const metadata = JSON.stringify({
          registrationNumber: certificateData.registration_number,
          studentName: certificateData.student_name,
          degree: certificateData.degree,
          session: certificateData.session,
          cgpa: certificateData.cgpa,
        });

        const tx = await contract.storeCertificate("0x" + certificateHash, metadata);
        const receipt = await tx.wait();

        // Step 5: Save to Database
        const certificate = await Certificate.create({
          certificateHash,
          studentName: certificateData.student_name,
          fatherName: certificateData.father_name,
          registrationNumber: certificateData.registration_number,
          rollNumber: certificateData.roll_number,
          degree: certificateData.degree,
          universityName: certificateData.university_name,
          session: certificateData.session,
          cgpa: certificateData.cgpa,
          universityId,
          issuer: certificateData.issuer,
          issueDate: new Date(),
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          status: "verified",
          ocrData: fields,
          confidence: ocrResult.confidence || 0,
          processingTime: ocrResult.processingTime || 0,
        });

        // Success
        fileResult.success = true;
        fileResult.data = {
          studentName: certificateData.student_name,
          registrationNumber: certificateData.registration_number,
          degree: certificateData.degree,
          certificateHash: certificateHash,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };

        // Cleanup file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return fileResult;

      } catch (error) {
        console.error(`❌ Error processing ${file.originalname}:`, error.message);
        fileResult.error = error.message;
        
        // Cleanup on error
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (e) {}
        }
        
        return fileResult;
      }
    };

    // Process files in parallel with concurrency control
    console.log(`🔄 Processing ${files.length} files with concurrency ${concurrencyLimit}...`);
    
    const fileQueue = [...files];
    const processingPromises = [];

    while (fileQueue.length > 0) {
      const batch = fileQueue.splice(0, concurrencyLimit);
      const batchPromises = batch.map(file => processFile(file));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({
            file: result.filename,
            error: result.error,
          });
        }
      });
      
      console.log(`📊 Progress: ${results.length + errors.length}/${files.length}`);
    }

    console.log(`✅ Bulk upload complete: ${results.length} success, ${errors.length} errors`);

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
    
    // Cleanup all files on major error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (e) {}
        }
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process bulk upload",
    });
  }
};

// Get certificate statistics
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

// Search certificates
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
