
import { useState, useEffect } from "react";
import API from "../../../api/axios";

export const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalTxs: 0,
    recordsStored: 0,
    verifiedStudents: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await API.get("/certificates/certificates", {
        params: { limit: 10 },
      });

      if (response.data.success) {
        const formattedTransactions = response.data.certificates.map(
          (cert) => ({
            id: cert._id || cert.certificateHash,
            student: cert.studentName || "Unknown",
            rollNumber: cert.registrationNumber || cert.rollNumber || "N/A",
            hash: cert.certificateHash || "0x...",
            time: new Date(
              cert.createdAt || cert.issueDate,
            ).toLocaleTimeString(),
            type: cert.type || "Upload",
            status: cert.status || "Verified",
            degree: cert.degree || "N/A",
            gpa: cert.cgpa || "N/A",
            gasUsed: "~45,000 Gas",
            blockNumber: cert.blockNumber || 0,
            revocationReason: cert.revocationReason || null,
            isBatchCertificate: cert.isBatchCertificate || false,
            merkleRoot: cert.merkleRoot || null,
          }),
        );

        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.message);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await API.get("/certificates/dashboard-stats");
      if (response.data.success) {
        setStats({
          totalTxs: Number(response.data.totalWriteTransactions) || 0,
          recordsStored: Number(response.data.recordsStored) || 0,
          verifiedStudents: Number(response.data.verifiedStudents) || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error.message);
    }
  };

  // Add new transaction
  const addTransaction = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Update transaction
  const updateTransaction = (hash, updates) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.hash === hash ? { ...tx, ...updates } : tx)),
    );
  };

  // ✅ FIXED: Update stats with proper number conversion
  const updateStats = (updates) => {
    setStats((prevStats) => {
      // Create a new stats object
      const newStats = { ...prevStats };

      // Update each field with proper number conversion
      if (updates.totalTxs !== undefined) {
        // If it's a function, call it with prev value
        if (typeof updates.totalTxs === "function") {
          newStats.totalTxs = updates.totalTxs(prevStats.totalTxs);
        } else {
          // Otherwise use the number directly
          newStats.totalTxs = Number(updates.totalTxs);
        }
      }

      if (updates.recordsStored !== undefined) {
        if (typeof updates.recordsStored === "function") {
          newStats.recordsStored = updates.recordsStored(
            prevStats.recordsStored,
          );
        } else {
          newStats.recordsStored = Number(updates.recordsStored);
        }
      }

      if (updates.verifiedStudents !== undefined) {
        if (typeof updates.verifiedStudents === "function") {
          newStats.verifiedStudents = updates.verifiedStudents(
            prevStats.verifiedStudents,
          );
        } else {
          newStats.verifiedStudents = Number(updates.verifiedStudents);
        }
      }

      console.log("📊 Stats updated:", newStats); // Debug log
      return newStats;
    });
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchTransactions(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    stats,
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchStats,
    addTransaction,
    updateTransaction,
    updateStats,
    refreshData,
  };
};
