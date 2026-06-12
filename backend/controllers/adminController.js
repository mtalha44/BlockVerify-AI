// controllers/adminController.js
import User from "../models/User.js";

// Make a user admin
export const makeAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to make admins" });
    }

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
    const admin = await User.findById(req.user.id).select("-password");

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

    const admin = await User.findById(req.user.id);

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
    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

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
    if (adminId === req.user.id) {
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
    const user = await User.findById(req.user.id);

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


// Add these functions to authController.js

// Verify University ID (for activation)
export const verifyUniversityId = async (req, res) => {
  try {
    const { universityId } = req.body;

    if (!universityId) {
      return res.status(400).json({ message: "University ID is required" });
    }

    // Find university by institutionalAccessId
    const university = await University.findOne({
      institutionalAccessId: universityId.toUpperCase(),
      status: "verified",
    });

    if (!university) {
      return res.status(400).json({
        message: "Invalid University ID. Please check and try again.",
        valid: false,
      });
    }

    // Check if already activated
    const existingUser = await User.findOne({ universityId: universityId.toUpperCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "University account already activated. Please login instead.",
        valid: false,
      });
    }

    res.status(200).json({
      message: "University ID verified successfully",
      valid: true,
      university: {
        name: university.name,
        institutionalAccessId: university.institutionalAccessId,
        email: university.authorizedEmail,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Activate University by ID (instead of token)
export const activateUniversityById = async (req, res) => {
  try {
    const { universityId, password } = req.body;

    if (!universityId || !password) {
      return res.status(400).json({
        message: "University ID and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Find university by institutionalAccessId
    const university = await University.findOne({
      institutionalAccessId: universityId.toUpperCase(),
      status: "verified",
    });

    if (!university) {
      return res.status(400).json({
        message: "Invalid University ID",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ universityId: universityId.toUpperCase() });

    if (user) {
      return res.status(400).json({
        message: "University account already activated. Please login.",
      });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user for university
    user = await User.create({
      fullName: university.primaryContactName,
      institution: university.name,
      universityId: university.institutionalAccessId,
      email: university.authorizedEmail,
      password: hashedPassword,
      role: "university",
      status: "active",
    });

    // Generate token for auto-login
    const authToken = generateToken(user._id);
    sendAuthCookie(res, authToken);

    res.status(200).json({
      message: "University account activated successfully",
      user: toAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};