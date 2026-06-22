import User from "../models/User.js";
import University from "../models/University.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const sendAuthCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const toAuthUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  institution: user.institution,
  universityId: user.universityId,
  email: user.email,
  role: user.role,
  status: user.status,
});

export const registerUser = async (req, res) => {
  try {
    const { fullName, institution, email, password } = req.body;

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

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      fullName,
      institution,
      email: email.toLowerCase(),
      password,
      role: "user",
    });

    const token = generateToken(user._id);
    sendAuthCookie(res, token);

    res.status(201).json({
      message: "Account created successfully",
      user: toAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is not active",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    sendAuthCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      user: toAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUniversity = async (req, res) => {
  try {
    const { universityId, email, password } = req.body;

    if ((!universityId && !email) || !password) {
      return res.status(400).json({
        message: "University ID/email and password are required",
      });
    }

    const query =
      universityId ?
        { universityId: universityId.toUpperCase() }
      : { email: email.toLowerCase() };

    const user = await User.findOne(query);

    if (!user || !["university", "admin"].includes(user.role)) {
      return res.status(401).json({
        message: "Invalid university credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "University account is not active",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid university credentials",
      });
    }

    const token = generateToken(user._id);
    sendAuthCookie(res, token);

    res.status(200).json({
      message: "University login successful",
      user: toAuthUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({ user: toAuthUser(req.user) });
};

export const verifyUniversityId = async (req, res) => {
  try {
    const { universityId } = req.body;

    if (!universityId) {
      return res.status(400).json({ message: "University ID is required" });
    }

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

    const existingUser = await User.findOne({
      universityId: universityId.toUpperCase(),
    });

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
      valid: false,
    });
  }
};

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

    const university = await University.findOne({
      institutionalAccessId: universityId.toUpperCase(),
      status: "verified",
    });

    if (!university) {
      return res.status(400).json({
        message: "Invalid University ID",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { universityId: university.institutionalAccessId },
        { email: university.authorizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "University account already activated. Please login.",
      });
    }

    const user = await User.create({
      fullName: university.primaryContactName,
      institution: university.name,
      universityId: university.institutionalAccessId,
      email: university.authorizedEmail,
      password,
      role: "university",
      status: "active",
    });

    university.credentialPackageLink = null;
    university.credentialPackageLinkExpiry = null;
    await university.save();

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

export const verifyActivationToken = async (req, res) => {
  try {
    const { token } = req.params;

    const university = await University.findOne({
      credentialPackageLink: token,
      credentialPackageLinkExpiry: { $gt: new Date() },
      status: "verified",
    });

    if (!university) {
      return res.status(400).json({
        message: "Invalid or expired activation token",
        valid: false,
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { universityId: university.institutionalAccessId },
        { email: university.authorizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "University account already activated. Please login instead.",
        valid: false,
      });
    }

    res.status(200).json({
      message: "Token is valid",
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
      valid: false,
    });
  }
};

export const activateUniversity = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const university = await University.findOne({
      credentialPackageLink: token,
      credentialPackageLinkExpiry: { $gt: new Date() },
      status: "verified",
    });

    if (!university) {
      return res.status(400).json({
        message: "Invalid or expired activation token",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { universityId: university.institutionalAccessId },
        { email: university.authorizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "University account already activated",
      });
    }

    const user = await User.create({
      fullName: university.primaryContactName,
      institution: university.name,
      universityId: university.institutionalAccessId,
      email: university.authorizedEmail,
      password,
      role: "university",
      status: "active",
    });

    university.credentialPackageLink = null;
    university.credentialPackageLinkExpiry = null;
    await university.save();

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
