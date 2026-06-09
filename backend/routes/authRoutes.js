import express from "express";

import {
  registerUser,
  loginUser,
  loginUniversity,
  logoutUser,
  getMe,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.post("/university-login", loginUniversity);

router.post("/logout", logoutUser);

router.get("/me", protect, getMe);

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
