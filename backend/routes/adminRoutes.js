import express from "express";
import {
  bootstrapAdmin,
  makeAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  deactivateAdmin,
  checkAdminStatus,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/bootstrap", bootstrapAdmin);

// Admin routes
router.post("/make-admin", protect, authorize("admin"), makeAdmin);
router.get("/profile", protect, authorize("admin"), getAdminProfile);
router.put("/profile", protect, authorize("admin"), updateAdminProfile);
router.get("/check-status", protect, authorize("admin"), checkAdminStatus);
router.get("/list", protect, authorize("admin"), getAllAdmins);
router.delete("/:adminId", protect, authorize("admin"), deactivateAdmin);

export default router;
