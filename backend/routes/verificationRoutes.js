// backend/src/routes/verificationRoutes.js
import express from "express";
import {
  verifyWithOCR,
  verifyCertificateByHash,
  batchVerifyCertificates,
} from "../src/controllers/verificationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/verify-with-ocr", verifyWithOCR);

// Verify certificate by hash
router.post("/verify-by-hash", verifyCertificateByHash);
router.get("/verify/:hash", verifyCertificateByHash);

// Batch verify multiple certificates
router.post("/batch-verify", batchVerifyCertificates);

export default router;
