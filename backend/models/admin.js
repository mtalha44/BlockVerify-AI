// models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: {
      type: [String],
      default: [
        "manage_universities",
        "view_applications",
        "approve_applications",
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
