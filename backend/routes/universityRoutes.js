// routes/universityRoutes.js
import express from "express";
import {
  submitEnrollmentApplication,
  getPendingApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  getAllApplications,
  getApplicationStats,
} from "../controllers/universityController.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadUniversityFiles } from "../middleware/upload.js"; // ADD THIS LINE

const router = express.Router();

// Public routes - ADD THE upload middleware HERE
router.post("/enroll", uploadUniversityFiles, submitEnrollmentApplication); // CHANGE THIS LINE

// Admin routes (require authentication and authorization)
router.get("/pending", authMiddleware, getPendingApplications);
router.get("/applications", authMiddleware, getAllApplications);
router.get("/stats", authMiddleware, getApplicationStats);
router.get("/:id", authMiddleware, getApplicationById);
router.put("/:id/approve", authMiddleware, approveApplication);
router.put("/:id/reject", authMiddleware, rejectApplication);

export default router;
