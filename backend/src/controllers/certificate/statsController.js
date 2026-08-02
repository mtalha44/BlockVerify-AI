// backend/src/controllers/certificate/statsController.js
import Certificate from "../../models/Certificate.js";
import BatchJob from "../../models/BatchJob.js";
import blockchainConfig from "../../config/blockchain.js";

// ============================================================
// GET BATCH STATUS
// ============================================================
export const getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batchJob = await BatchJob.findOne({ batchId });

    if (!batchJob) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.json({
      success: true,
      batch: batchJob,
    });
  } catch (error) {
    console.error("Batch status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET DASHBOARD STATS
// ============================================================
export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    const userRole = user?.role;
    const universityId = user?.universityId || user?.id;

    // Build filter based on user role
    let filter = {};

    if (userRole === "university" || userRole === "admin") {
      // University/Admin: Show only their certificates
      filter = { universityId: universityId };
    } else {
      // Regular user/employer: Show ALL certificates (global stats)
      filter = {};
    }

    console.log(`📊 Fetching stats for role: ${userRole}`);
    console.log(`📊 Filter:`, filter);

    const dbTotal = await Certificate.countDocuments(filter);
    const verifiedCount = await Certificate.countDocuments({
      ...filter,
      status: "verified",
    });
    const revokedCount = await Certificate.countDocuments({
      ...filter,
      status: "revoked",
    });
    const recentTransactions = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "studentName registrationNumber certificateHash transactionHash status createdAt",
      );

    let totalCertificates = 0;
    try {
      await blockchainConfig.initialize();
      const contract = blockchainConfig.getContract();

      if (contract.getCertificateCount) {
        totalCertificates = Number(await contract.getCertificateCount()) || 0;
      } else {
        totalCertificates = dbTotal;
      }
    } catch (blockchainError) {
      console.warn("⚠️ Blockchain stats not available, using database stats");
      totalCertificates = dbTotal;
    }

    res.json({
      success: true,
      totalWriteTransactions: totalCertificates || dbTotal || 0,
      recordsStored: dbTotal || 0,
      verifiedStudents: verifiedCount || 0,
      revokedCount: revokedCount || 0,
      recentTransactions: recentTransactions || [],
      userRole: userRole,
      isGlobalView: userRole !== "university" && userRole !== "admin",
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET CERTIFICATE STATS
// ============================================================
export const getCertificateStats = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;

    const stats = await Certificate.aggregate([
      { $match: { universityId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Certificate.countDocuments({ universityId });
    const recentUploads = await Certificate.find({ universityId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total,
        verified: stats.find((s) => s._id === "verified")?.count || 0,
        revoked: stats.find((s) => s._id === "revoked")?.count || 0,
        pending: stats.find((s) => s._id === "pending")?.count || 0,
        failed: stats.find((s) => s._id === "failed")?.count || 0,
      },
      recentUploads,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL CERTIFICATES
// ============================================================
export const getCertificates = async (req, res) => {
  try {
    const universityId = req.user?.universityId || req.user?.id;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { universityId };
    if (status) filter.status = status;

    const certificates = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Certificate.countDocuments(filter);

    res.status(200).json({
      success: true,
      certificates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
