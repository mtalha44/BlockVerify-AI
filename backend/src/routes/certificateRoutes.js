// backend/src/routes/certificateRoutes.js
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
  bulkUploadCertificates,
} from "../controllers/certificateController.js";
import protect from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists - Use absolute path
const uploadDir = path.join(__dirname, "../../uploads/certificates");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadDir}`);
}

// Configure multer with better error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // Clean filename: remove special characters and spaces
    const cleanName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, "_")
      .slice(0, 50);
    cb(null, "cert-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, JPEG, and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: fileFilter,
});

// Routes
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    // Single file upload with error handling
    upload.single("certificate")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "FILE_TOO_LARGE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 10MB.",
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

router.post("/verify", protect, verifyCertificateByHash);

router.get("/certificates", protect, getCertificates);

router.get("/certificate/:id", protect, getCertificateById);

router.get("/stats", protect, getCertificateStats);

router.get("/dashboard-stats", protect, getDashboardStats);

router.get("/search", protect, searchCertificates);

router.post("/revoke/:hash", protect, revokeCertificate);

router.post(
  "/bulk-upload",
  protect,
  (req, res, next) => {
    upload.array("certificates", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
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

export default router;
