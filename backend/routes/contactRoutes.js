import express from "express";
import { submitContactForm } from "../src/controllers/contactController.js";

const router = express.Router();

// Public route - no authentication required
router.post("/contact", submitContactForm);

export default router;
