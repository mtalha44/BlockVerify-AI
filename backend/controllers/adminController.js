// controllers/adminController.js
import User from "../models/User.js";

export const bootstrapAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, bootstrapKey } = req.body;

    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount > 0) {
      return res.status(403).json({ message: "Admin bootstrap is already closed" });
    }

    if (
      process.env.ADMIN_BOOTSTRAP_KEY &&
      bootstrapKey !== process.env.ADMIN_BOOTSTRAP_KEY
    ) {
      return res.status(403).json({ message: "Invalid admin bootstrap key" });
    }

    if (process.env.NODE_ENV === "production" && !process.env.ADMIN_BOOTSTRAP_KEY) {
      return res.status(403).json({
        message: "ADMIN_BOOTSTRAP_KEY must be configured in production",
      });
    }

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const admin = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: "admin",
      status: "active",
    });

    res.status(201).json({
      message: "First admin created successfully. You can now log in.",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Make a user admin
export const makeAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      message: "User promoted to admin successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get admin profile
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ admin });
  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { fullName, institution, email } = req.body;

    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (fullName) admin.fullName = fullName;
    if (institution) admin.institution = institution;
    if (email) admin.email = email.toLowerCase();

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: admin._id,
        fullName: admin.fullName,
        institution: admin.institution,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all admins
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");

    res.status(200).json({ count: admins.length, admins });
  } catch (error) {
    next(error);
  }
};

// Deactivate admin
export const deactivateAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    // Prevent self-deactivation
    if (adminId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot deactivate yourself" });
    }

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.status = "suspended";
    await admin.save();

    res.status(200).json({ message: "Admin deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

// Check admin status
export const checkAdminStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      isAdmin: user.role === "admin",
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};
