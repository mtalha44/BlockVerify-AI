import mongoose from "mongoose";

const batchJobSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true, index: true },
    universityId: { type: String, required: true, index: true },

    type: { type: String, enum: ["single", "bulk", "excel"], required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "partial"],
      default: "pending",
    },

    totalCertificates: { type: Number, default: 0 },
    processedCertificates: { type: Number, default: 0 },
    successfulCertificates: { type: Number, default: 0 },
    failedCertificates: { type: Number, default: 0 },

    transactions: [
      {
        certificateHash: String,
        transactionHash: String,
        status: String,
        error: String,
        timestamp: Date,
      },
    ],

    merkleRoot: { type: String, default: null },
    merkleTransactionHash: { type: String, default: null },

    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },

    errorLog: [
      {
        error: String,
        timestamp: Date,
        certificateData: Object,
      },
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

batchJobSchema.index({ universityId: 1, createdAt: -1 });
batchJobSchema.index({ status: 1 });

export default mongoose.model("BatchJob", batchJobSchema);
