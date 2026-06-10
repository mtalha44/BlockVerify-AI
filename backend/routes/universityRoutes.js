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

const router = express.Router();

// Public routes
router.post("/enroll", submitEnrollmentApplication);

// Admin routes (require authentication and authorization)
router.get("/pending", authMiddleware, getPendingApplications);
router.get("/applications", authMiddleware, getAllApplications);
router.get("/stats", authMiddleware, getApplicationStats);
router.get("/:id", authMiddleware, getApplicationById);
router.put("/:id/approve", authMiddleware, approveApplication);
router.put("/:id/reject", authMiddleware, rejectApplication);

export default router;
