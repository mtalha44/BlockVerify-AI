import User from "../models/User.js";
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

// REGISTER
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

    // Check existing user
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      institution,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
    });

    // Token
    const token = generateToken(user._id);

    // Cookie
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

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
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

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Save cookie
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

// UNIVERSITY LOGIN
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

// LOGOUT
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

// GET CURRENT USER
export const getMe = async (req, res) => {
  res.status(200).json({ user: toAuthUser(req.user) });
};
