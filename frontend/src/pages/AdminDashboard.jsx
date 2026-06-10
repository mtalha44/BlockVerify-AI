import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { universityAPI } from "../services/universityAPI";
import styles from "./AdminDashboard.module.css";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationDetails from "../components/ApplicationDetails";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [activeTab, page, token]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch applications
      const appData = await universityAPI.getAllApplications(token, activeTab, page);
      setApplications(appData.applications);

      // Fetch stats
      const statsData = await universityAPI.getStats(token);
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId, adminNotes) => {
    try {
      await universityAPI.approveApplication(appId, adminNotes, token);
      setShowDetails(false);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to approve application");
    }
  };

  const handleReject = async (appId, rejectionReason) => {
    try {
      await universityAPI.rejectApplication(appId, rejectionReason, token);
      setShowDetails(false);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to reject application");
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1>University Enrollment Verification</h1>
          <p>Manage and review university registration applications</p>
        </div>
        <div className={styles.userInfo}>
          <span>Admin: {user?.fullName || user?.username}</span>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.label}>Total Applications</span>
            <span className={styles.value}>{stats.totalApplications}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.label}>Pending</span>
            <span className={`${styles.value} ${styles.pending}`}>{stats.stats.pending || 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.label}>Verified</span>
            <span className={`${styles.value} ${styles.verified}`}>
              {stats.stats.verified || 0}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.label}>Rejected</span>
            <span className={`${styles.value} ${styles.rejected}`}>
              {stats.stats.rejected || 0}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "pending" ? styles.active : ""}`}
          onClick={() => {
            setActiveTab("pending");
            setPage(1);
          }}
        >
          Pending ({stats?.stats.pending || 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "verified" ? styles.active : ""}`}
          onClick={() => {
            setActiveTab("verified");
            setPage(1);
          }}
        >
          Verified ({stats?.stats.verified || 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "rejected" ? styles.active : ""}`}
          onClick={() => {
            setActiveTab("rejected");
            setPage(1);
          }}
        >
          Rejected ({stats?.stats.rejected || 0})
        </button>
      </div>

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Applications List */}
      <div className={styles.applicationsContainer}>
        {loading ? (
          <div className={styles.loading}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className={styles.empty}>No applications found</div>
        ) : (
          <div className={styles.applicationsList}>
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                application={app}
                onSelect={() => {
                  setSelectedApp(app);
                  setShowDetails(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApp && (
        <ApplicationDetails
          application={selectedApp}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => {
            setShowDetails(false);
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}
