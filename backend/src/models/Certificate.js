// backend/src/models/Certificate.js
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Student Information
    studentName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      default: "",
    },
    registrationNumber: {
      type: String,
      required: true,
      index: true,
    },
    rollNumber: {
      type: String,
      default: "",
    },
    degree: {
      type: String,
      required: true,
    },
    universityName: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      default: "",
    },
    cgpa: {
      type: String,
      default: "",
    },

    // Metadata
    universityId: {
      type: String,
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },

    // Blockchain Info
    transactionHash: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: Number,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "verified", "revoked", "failed"],
      default: "pending",
    },
    revocationReason: {
      type: String,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },

    // OCR Data
    ocrData: {
      type: Object,
      default: null,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    processingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
certificateSchema.index({ universityId: 1, createdAt: -1 });
certificateSchema.index({ registrationNumber: 1 });
certificateSchema.index({ studentName: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
