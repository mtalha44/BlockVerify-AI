import express from "express";
import {
  makeAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  deactivateAdmin,
  checkAdminStatus,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.post("/make-admin", authMiddleware, makeAdmin);
router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);
router.get("/check-status", authMiddleware, checkAdminStatus);
router.get("/list", authMiddleware, getAllAdmins);
router.delete("/:adminId", authMiddleware, deactivateAdmin);

export default router;
