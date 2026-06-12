// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { universityAPI } from "../services/universityAPI";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationDetails from "../components/ApplicationDetails";
import API from "../api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);

  // Check authentication and role on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      if (userData.role !== "admin") {
        console.log("Not admin, redirecting to user dashboard");
        navigate("/user-dashboard");
        return;
      }

      // Verify with backend that session is still valid
      try {
        await API.get("/auth/me");
        console.log("Admin authenticated successfully");
      } catch (err) {
        console.error("Auth verification failed:", err);
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch data when tab or page changes
  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [activeTab, page, user]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching applications for tab:", activeTab);

      // No token parameter needed - cookies handle auth automatically
      const appData = await universityAPI.getAllApplications(activeTab, page);
      setApplications(appData.applications || []);

      // Fetch stats - no token parameter needed
      const statsData = await universityAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load applications");
      if (err.response?.status === 401) {
        console.log("Unauthorized, clearing user");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId, adminNotes) => {
    try {
      await universityAPI.approveApplication(appId, adminNotes);
      setShowDetails(false);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to approve application");
    }
  };

  const handleReject = async (appId, rejectionReason) => {
    try {
      await universityAPI.rejectApplication(appId, rejectionReason);
      setShowDetails(false);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to reject application");
    }
  };

  console.log("AdminDashboard mounted at path:", location.pathname);
  console.log("User from localStorage:", user);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002677]">
            University Enrollment Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and review university registration applications
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Total Applications</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalApplications || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.stats?.pending || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Verified</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.stats?.verified || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500">Rejected</div>
              <div className="text-2xl font-bold text-red-600">
                {stats.stats?.rejected || 0}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "pending" ?
                "text-[#002677] border-b-2 border-[#002677]"
              : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("pending");
              setPage(1);
            }}
          >
            Pending ({stats?.stats?.pending || 0})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "verified" ?
                "text-[#002677] border-b-2 border-[#002677]"
              : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("verified");
              setPage(1);
            }}
          >
            Verified ({stats?.stats?.verified || 0})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "rejected" ?
                "text-[#002677] border-b-2 border-[#002677]"
              : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("rejected");
              setPage(1);
            }}
          >
            Rejected ({stats?.stats?.rejected || 0})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Applications List */}
        {loading ?
          <div className="text-center py-12">Loading applications...</div>
        : applications.length === 0 ?
          <div className="text-center py-12 text-gray-500">
            No applications found
          </div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        }
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
