import Certificate from "../../models/Certificate.js";
import blockchainConfig from "../../config/blockchain.js";
import verificationService from "../../services/verification/verificationService.js";
import sha256Service from "../../services/hash/sha256Service.js";
import { verifyWithOCR } from "../../controllers/verificationController.js";

// VERIFY CERTIFICATE BY HASH
export const verifyCertificateByHash = async (req, res) => {
  try {
    const { hash } = req.params || req.body;

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: "Certificate hash is required",
      });
    }

    console.log(`🔍 Verifying certificate: ${hash}`);

    await blockchainConfig.initialize();
    const contract = blockchainConfig.getContract();

    const isValid = await contract.verifyCertificate(hash);

    let details = null;
    try {
      details = await contract.getCertificate(hash);
    } catch (detailError) {
      console.log(
        "ℹ️ getCertificate method not available, using basic verification",
      );
    }

    const certificate = await Certificate.findOne({ certificateHash: hash });

    res.status(200).json({
      success: true,
      isValid,
      details: details
        ? {
            registrationNumber: details[0],
            studentName: details[1],
            degree: details[2],
            issueDate: new Date(Number(details[3]) * 1000),
            isValid: details[4],
            ipfsHash: details[5],
          }
        : null,
      certificate: certificate || null,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET CERTIFICATE BY ID
// ============================================================
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Get certificate error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SEARCH CERTIFICATES
// ============================================================
export const searchCertificates = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query, "i");
    const certificates = await Certificate.find({
      universityId,
      $or: [
        { studentName: searchRegex },
        { registrationNumber: searchRegex },
        { degree: searchRegex },
        { studentId: searchRegex },
        { certificateHash: searchRegex },
      ],
    }).limit(20);

    res.status(200).json({
      success: true,
      certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SEARCH STUDENTS FOR REVOCATION
// ============================================================
export const searchStudentsForRevocation = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchRegex = new RegExp(query, "i");

    const certificates = await Certificate.find({
      universityId,
      status: "verified",
      $or: [
        { studentName: searchRegex },
        { registrationNumber: searchRegex },
        { rollNumber: searchRegex },
        { studentId: searchRegex },
      ],
    })
      .limit(20)
      .select(
        "studentName registrationNumber rollNumber certificateHash degree issueDate",
      );

    res.status(200).json({
      success: true,
      students: certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
