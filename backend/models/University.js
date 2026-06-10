import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    authorizedEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accreditationFile: {
      type: String,
      required: true,
    },
    registrationFile: {
      type: String,
      required: true,
    },
    authorityFile: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    institutionalAccessId: {
      type: String,
      unique: true,
      sparse: true,
    },
    credentialPackageLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    credentialPackageLinkExpiry: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    primaryContactName: {
      type: String,
      required: true,
    },
    primaryContactPhone: {
      type: String,
      required: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
universitySchema.index({ status: 1 });
universitySchema.index({ email: 1 });
universitySchema.index({ domain: 1 });

export default mongoose.model("University", universitySchema);
