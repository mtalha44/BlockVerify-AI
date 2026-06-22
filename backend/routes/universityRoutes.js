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
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { uploadUniversityFiles } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.post("/enroll", uploadUniversityFiles, submitEnrollmentApplication);

// Admin routes (require authentication and authorization)
router.get("/pending", protect, authorize("admin"), getPendingApplications);
router.get("/applications", protect, authorize("admin"), getAllApplications);
router.get("/stats", protect, authorize("admin"), getApplicationStats);
router.get("/:id", protect, authorize("admin"), getApplicationById);
router.put("/:id/approve", protect, authorize("admin"), approveApplication);
router.put("/:id/reject", protect, authorize("admin"), rejectApplication);

export default router;
