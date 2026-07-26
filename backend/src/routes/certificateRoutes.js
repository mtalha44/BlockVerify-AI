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
  uploadCertificateForVerification,
} from "../controllers/certificateController.js";
import { verifyWithOCR } from "../controllers/verificationController.js";
import protect from "../../middleware/authMiddleware.js";
import { bulkImportFromExcel } from "../controllers/certificateController.js";
import blockchainConfig from "../config/blockchain.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/certificates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadDir}`);
}

// Configure multer
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
    cb(null, "cert-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
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
    fileSize: 10 * 1024 * 1024,
    files: 50,
  },
  fileFilter: fileFilter,
});

// OCR & VERIFICATION ROUTES - ADD THESE

//    Upload certificate for OCR extraction ONLY (no blockchain storage)
//    Used for: User verification flow where user reviews and corrects data
router.post(
  "/upload-for-ocr",
  protect,
  (req, res, next) => {
    upload.single("certificate")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  uploadCertificateForVerification,
);

//    Upload and STORE certificate on blockchain (for University Admin)
//    Used for: University Admin single upload - OCR + Blockchain storage
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    upload.single("certificate")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
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

// 3. Verify certificate with corrected OCR data
router.post("/verify-ocr", protect, verifyWithOCR);

// 4. Verify certificate by hash
router.post("/verify", protect, verifyCertificateByHash);
router.get("/verify/:hash", protect, verifyCertificateByHash);

// Bulk Excel Certificate Upload
router.post(
  "/bulk-import",
  protect,
  upload.single("excel"),
  bulkImportFromExcel,
);

// Bulk upload with 50 certificate limits
router.post(
  "/bulk-upload",
  protect,
  (req, res, next) => {
    upload.array("certificates", 50)(req, res, (err) => {
      if (err) {
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

// REVOCATION ROUTES

// Search students for revocation
router.get("/search-students", protect, searchStudentsForRevocation);

// Revoke certificate
router.post("/revoke/:hash", protect, revokeCertificate);

// QUERY & STATS ROUTES

// Get all certificates
router.get("/certificates", protect, getCertificates);

// Get certificate by ID
router.get("/certificate/:id", protect, getCertificateById);

// Get certificate stats
router.get("/stats", protect, getCertificateStats);

// Get dashboard stats
router.get("/dashboard-stats", protect, getDashboardStats);

// Search certificates
router.get("/search", protect, searchCertificates);

// DEBUG ROUTE (for development)

router.get("/debug-contract", protect, async (req, res) => {
  try {
    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

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
