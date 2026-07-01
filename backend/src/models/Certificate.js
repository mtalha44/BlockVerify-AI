// backend/src/models/Certificate.js
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    // CORE CERTIFICATE DATA
    certificateHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

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

    // =====================================================
    // METADATA
    // =====================================================
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

    // =====================================================
    // BLOCKCHAIN INFO
    // =====================================================
    transactionHash: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: Number,
    },

    // =====================================================
    // MERKLE TREE INFORMATION (FOR EXCEL BATCH)
    // =====================================================
    merkleRoot: {
      type: String,
      default: null,
      index: true,
    },
    merkleProof: {
      type: [String],
      default: [],
    },
    leafIndex: {
      type: Number,
      default: null,
    },
    batchId: {
      type: String,
      default: null,
    },
    batchLeafCount: {
      type: Number,
      default: 0,
    },
    batchTransactionHash: {
      type: String,
      default: null,
    },
    isBatchCertificate: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // STATUS
    // =====================================================
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
    revokedBy: {
      type: String,
      default: null,
    },
    revocationType: {
      type: String,
      enum: ["single", "batch", null],
      default: null,
    },

    // =====================================================
    // OCR DATA
    // =====================================================
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
certificateSchema.index({ certificateHash: 1 });
certificateSchema.index({ merkleRoot: 1 });
certificateSchema.index({ batchId: 1 });
certificateSchema.index({ isBatchCertificate: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
