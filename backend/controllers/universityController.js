import crypto from "crypto";
import University from "../models/University.js";
import {
  sendUniversityApprovalEmail,
  sendUniversityRejectionEmail,
} from "../utils/emailService.js";

const generateInstitutionalId = () => {
  return `INST-${Date.now()}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
};

const normalizeDomain = (value) => {
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(`https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
  }
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

    const normalizedEmail = email.toLowerCase();
    const normalizedAuthorizedEmail = authorizedEmail.toLowerCase();
    const normalizedDomain = normalizeDomain(domain);

    const existingUniversity = await University.findOne({
      $or: [
        { email: normalizedEmail },
        { authorizedEmail: normalizedAuthorizedEmail },
        { domain: normalizedDomain },
        { registrationNumber },
      ],
    });

    if (existingUniversity) {
      return res.status(400).json({
        message:
          "A university with this email, domain, or registration number already exists",
      });
    }

    const files = req.files;
    const accreditationFile = files?.accreditationFile?.[0]?.path || "";
    const registrationFile = files?.registrationFile?.[0]?.path || "";
    const authorityFile = files?.authorityFile?.[0]?.path || "";

    if (!accreditationFile || !registrationFile || !authorityFile) {
      return res
        .status(400)
        .json({ message: "All required files must be uploaded" });
    }

    const university = await University.create({
      name,
      email: normalizedEmail,
      authorizedEmail: normalizedAuthorizedEmail,
      domain: normalizedDomain,
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

    res.status(201).json({
      message:
        "Enrollment application submitted successfully. Our team will review it within 24 hours.",
      university: {
        id: university._id,
        name: university.name,
        email: university.email,
        status: university.status,
      },
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
    const application = await University.findById(req.params.id);

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
      return res
        .status(400)
        .json({ message: "Only pending applications can be approved" });
    }

    const institutionalAccessId = generateInstitutionalId();
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationLink = `${process.env.FRONTEND_URL}/UniversityActivation/${activationToken}`;

    university.status = "verified";
    university.institutionalAccessId = institutionalAccessId;
    university.credentialPackageLink = activationToken;
    university.credentialPackageLinkExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    university.verifiedAt = new Date();
    university.adminNotes = adminNotes || "";

    await university.save();

    const emailResult = await sendUniversityApprovalEmail(
      university.authorizedEmail || university.email,
      activationLink,
      institutionalAccessId,
      university.primaryContactName,
      university.name,
    );

    if (!emailResult.success) {
      console.error("Failed to send approval email:", emailResult.error);
    }

    res.status(200).json({
      message:
        "Application approved successfully. Credential package email sent to university.",
      university: {
        id: university._id,
        name: university.name,
        status: university.status,
        institutionalAccessId: university.institutionalAccessId,
        credentialPackageLinkExpiry: university.credentialPackageLinkExpiry,
      },
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
      return res
        .status(400)
        .json({ message: "Only pending applications can be rejected" });
    }

    university.status = "rejected";
    university.rejectionReason = rejectionReason;
    await university.save();

    const emailResult = await sendUniversityRejectionEmail(
      university.authorizedEmail,
      rejectionReason,
      university.primaryContactName,
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
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await University.countDocuments(query);

    res.status(200).json({
      count: applications.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
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
