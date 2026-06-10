import crypto from "crypto";
import University from "../models/University.js";
import Admin from "../models/Admin.js";
import {
  sendUniversityApprovalEmail,
  sendUniversityRejectionEmail,
} from "../utils/emailService.js";

// Generate unique institutional access ID
const generateInstitutionalId = () => {
  return `INST-${Date.now()}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
};

// Generate credential package link token
const generateCredentialToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const submitEnrollmentApplication = async (req, res, next) => {
  try {
    const {
      name,
      email,
      authorizedEmail,
      domain,
      country,
      city,
      registrationNumber,
      primaryContactName,
      primaryContactPhone,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !authorizedEmail ||
      !domain ||
      !country ||
      !city ||
      !registrationNumber ||
      !primaryContactName ||
      !primaryContactPhone
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing applications
    const existingUniversity = await University.findOne({
      $or: [{ email }, { domain }, { registrationNumber }],
    });

    if (existingUniversity) {
      return res.status(400).json({
        message: "A university with this email, domain, or registration number already exists",
      });
    }

    // Handle file uploads (assuming files are uploaded separately)
    const accreditationFile = req.files?.accreditationFile?.[0]?.path || "";
    const registrationFile = req.files?.registrationFile?.[0]?.path || "";
    const authorityFile = req.files?.authorityFile?.[0]?.path || "";

    if (!accreditationFile || !registrationFile || !authorityFile) {
      return res.status(400).json({ message: "All required files must be uploaded" });
    }

    // Create new university application
    const university = new University({
      name,
      email: email.toLowerCase(),
      authorizedEmail: authorizedEmail.toLowerCase(),
      domain: domain.toLowerCase(),
      country,
      city,
      registrationNumber,
      accreditationFile,
      registrationFile,
      authorityFile,
      primaryContactName,
      primaryContactPhone,
      status: "pending",
    });

    await university.save();

    res.status(201).json({
      message:
        "Enrollment application submitted successfully. Our team will review it within 24 hours.",
      university,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingApplications = async (req, res, next) => {
  try {
    const applications = await University.find({ status: "pending" }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await University.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

export const approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (university.status !== "pending") {
      return res.status(400).json({ message: "Only pending applications can be approved" });
    }

    // Generate credentials
    const institutionalAccessId = generateInstitutionalId();
    const credentialToken = generateCredentialToken();
    const credentialLink = `${process.env.FRONTEND_URL}/credential-setup/${credentialToken}`;

    // Update university
    university.status = "verified";
    university.institutionalAccessId = institutionalAccessId;
    university.credentialPackageLink = credentialToken;
    university.credentialPackageLinkExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    university.verifiedAt = new Date();
    university.adminNotes = adminNotes || "";

    await university.save();

    // Send approval email with credential package
    const emailResult = await sendUniversityApprovalEmail(
      university.email,
      credentialLink,
      institutionalAccessId,
      university.primaryContactName
    );

    if (!emailResult.success) {
      console.error("Failed to send approval email:", emailResult.error);
    }

    res.status(200).json({
      message: "Application approved successfully. Credential package email sent.",
      university,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (university.status !== "pending") {
      return res.status(400).json({ message: "Only pending applications can be rejected" });
    }

    university.status = "rejected";
    university.rejectionReason = rejectionReason;

    await university.save();

    // Send rejection email
    const emailResult = await sendUniversityRejectionEmail(
      university.email,
      rejectionReason,
      university.primaryContactName
    );

    if (!emailResult.success) {
      console.error("Failed to send rejection email:", emailResult.error);
    }

    res.status(200).json({
      message: "Application rejected. Notification email sent to university.",
      university,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const applications = await University.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await University.countDocuments(query);

    res.status(200).json({
      count: applications.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await University.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalApplications = await University.countDocuments();

    res.status(200).json({
      totalApplications,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    next(error);
  }
};
