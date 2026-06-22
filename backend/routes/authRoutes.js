// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  loginUniversity,
  logoutUser,
  getMe,
  verifyUniversityId,
  activateUniversityById,
  verifyActivationToken,
  activateUniversity,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/university-login", loginUniversity);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

// University Activation Routes (ID-based)
router.post("/verify-university-id", verifyUniversityId);
router.post("/activate-university-by-id", activateUniversityById);
router.get("/verify-activation-token/:token", verifyActivationToken);
router.post("/activate-university", activateUniversity);

router.get(
  "/university-only",
  protect,
  authorize("university", "admin"),
  (req, res) => {
    res.status(200).json({
      message: "University access granted",
      user: req.user,
    });
  },
);

export default router;
