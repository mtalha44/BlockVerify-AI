// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    institution: {
      type: String,
      trim: true,
    },

    // Use 'universityId' (matches your MongoDB)
    universityId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["user", "university", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to hash password
userSchema.pre("save", async function () {
  // Only hash password if it was modified
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
