// backend/src/routes/certificateRoutes.js
// Update the multer configuration

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  uploadSingleCertificate,
  verifyCertificateByHash,
  getCertificates,
  getCertificateById,
  getCertificateStats,
  searchCertificates,
  getDashboardStats,
  revokeCertificate,
  searchStudentsForRevocation,
  bulkUploadCertificates,
  // getLatestTransactions,
} from "../controllers/certificateController.js";
import protect from "../../middleware/authMiddleware.js";
import { bulkImportFromExcel } from '../controllers/certificateController.js';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/certificates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadDir}`);
}

// Configure multer with increased limits
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, "_")
      .slice(0, 50);
    cb(null, "cert-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/png",
    "image/jpeg",
    "image/jpg",

    // PDF
    "application/pdf",

    // Excel (.xlsx)
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Excel (.xls)
    "application/vnd.ms-excel",

    // CSV
    "text/csv",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("Rejected MIME:", file.mimetype);

    cb(
      new Error(
        "Only PNG, JPG, JPEG, PDF, XLSX, XLS and CSV files are allowed",
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 50, // Allow up to 50 files in bulk upload
    fieldSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// Single file upload
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    upload.single("certificate")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "FILE_TOO_LARGE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 10MB.",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message:
              "Unexpected field. Please use 'certificate' as field name.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  uploadSingleCertificate,
);

//For Bulk Excel Certificate Upload
router.post(
  "/bulk-import",
  protect,
  upload.single("excel"),
  bulkImportFromExcel,
);

//for revocation search
router.get("/search-students", protect, searchStudentsForRevocation);

// Bulk upload - with increased limits
router.post(
  "/bulk-upload",
  protect,
  (req, res, next) => {
    upload.array("certificates", 50)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "FILE_TOO_LARGE") {
          return res.status(400).json({
            success: false,
            message:
              "One or more files are too large. Maximum size is 10MB per file.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Too many files. Maximum is 50 files per batch.",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message:
              "Unexpected field. Please use 'certificates' as field name.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  bulkUploadCertificates,
);

router.post("/verify", protect, verifyCertificateByHash);
router.get("/certificates", protect, getCertificates);
router.get("/certificate/:id", protect, getCertificateById);
router.get("/stats", protect, getCertificateStats);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/search", protect, searchCertificates);
router.post("/revoke/:hash", protect, revokeCertificate);
// Debug endpoint to check contract
router.get("/debug-contract", protect, async (req, res) => {
  try {
    await blockchainConfig.initialize();
    await blockchainConfig.verifyContractMethods();
    
    const contract = blockchainConfig.getContract();
    
    // Try to call getCertificateCount
    let count = 0;
    try {
      count = Number(await contract.getCertificateCount());
    } catch (e) {
      console.log("getCertificateCount error:", e.message);
    }
    
    res.json({
      success: true,
      methods: {
        storeCertificate: !!contract.storeCertificate,
        storeMerkleBatch: !!contract.storeMerkleBatch,
        revokeCertificate: !!contract.revokeCertificate,
        revokeMerkleBatch: !!contract.revokeMerkleBatch,
        verifyCertificate: !!contract.verifyCertificate,
        verifyMerkleProof: !!contract.verifyMerkleProof,
        getIssuerStats: !!contract.getIssuerStats,
        getCertificateCount: !!contract.getCertificateCount,
      },
      count,
      contractAddress: process.env.CONTRACT_ADDRESS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
