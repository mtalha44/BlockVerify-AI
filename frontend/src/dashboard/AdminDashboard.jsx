import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { universityAPI } from "../services/universityAPI";
import ApplicationCard from "../components/SystemAdminSections/ApplicationCard";
import ApplicationDetails from "../components/SystemAdminSections/ApplicationDetails";
import API from "../api/axios";
import {
  LayoutDashboard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  User,
  Shield,
  TrendingUp,
  TrendingDown,
  Users,
  FileCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      const appData = await universityAPI.getAllApplications(activeTab, page);
      setApplications(appData.applications || []);
      const statsData = await universityAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load applications");
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

const handleApprove = async (appId, adminNotes) => {
  setIsProcessing(true);
  try {
    await universityAPI.approveApplication(appId, adminNotes);
    // Close modal immediately after successful approval
    setShowDetails(false);
    setSelectedApp(null);
    // Refresh data
    await fetchData();
  } catch (err) {
    setError(err.message || "Failed to approve application");
  } finally {
    setIsProcessing(false);
  }
};

const handleReject = async (appId, rejectionReason) => {
  setIsProcessing(true);
  try {
    await universityAPI.rejectApplication(appId, rejectionReason);
    // Close modal immediately after successful rejection
    setShowDetails(false);
    setSelectedApp(null);
    // Refresh data
    await fetchData();
  } catch (err) {
    setError(err.message || "Failed to reject application");
  } finally {
    setIsProcessing(false);
  }
};

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  const getStatusCount = (status) => {
    return stats?.stats?.[status] || 0;
  };

  // Filter applications by search term
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.name?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.primaryContactName?.toLowerCase().includes(term) ||
      app.registrationNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-gradient-to-br from-[#002677] to-[#1a3a7a] rounded-xl shadow-lg shadow-[#002677]/20">
                <Shield className="w-5 h-5 text-white" />
              </div> */}

              <div className=".logo">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-auto">
                    <img src="../../images/logo.png" alt="" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-color-primary tracking-tight">
                      Admin Dashboard
                    </h1>
                    <p className="text-xs text-slate-500">
                      University Enrollment Verification
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {user?.fullName || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between max-[425px]:flex-col-reverse max-[425px]:gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase max-[425px]:text-center tracking-wider">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold max-[425px]:text-center text-slate-900 mt-1">
                    {stats.totalApplications || 0}
                  </p>
                </div>
                <div className="p-2.5 max-[465px]: bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between max-[425px]:flex-col-reverse max-[425px]:gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase max-[425px]:text-center tracking-wider">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold max-[425px]:text-center text-amber-600 mt-1">
                    {getStatusCount("pending")}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg shadow-amber-400/20">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between max-[425px]:flex-col-reverse max-[425px]:gap-3">
                <div>
                  <p className="text-xs font-medium max-[425px]:text-center text-slate-500 uppercase tracking-wider">
                    Verified
                  </p>
                  <p className="text-2xl font-bold max-[425px]:text-center text-emerald-600 mt-1">
                    {getStatusCount("verified")}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-400/20">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between max-[425px]:flex-col-reverse max-[425px]:gap-3">
                <div>
                  <p className="text-xs font-medium max-[425px]:text-center text-slate-500 uppercase tracking-wider">
                    Rejected
                  </p>
                  <p className="text-2xl font-bold max-[425px]:text-center text-red-600 mt-1">
                    {getStatusCount("rejected")}
                  </p>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-red-400 to-red-500 rounded-xl shadow-lg shadow-red-400/20">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-1">
              {["pending", "verified", "rejected"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab ?
                      "bg-white text-[#002677] shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                      activeTab === tab ?
                        "bg-[#002677]/10 text-[#002677]"
                      : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {getStatusCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002677]/20 focus:border-[#002677] transition"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 text-slate-500 hover:text-[#002677] hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading applications</p>
              <p className="text-red-600/80">{error}</p>
            </div>
          </div>
        )}

        {/* Applications Grid */}
        {loading ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm animate-pulse"
              >
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded"></div>
                  <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                </div>
                <div className="mt-4 h-8 w-full bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        : filteredApplications.length === 0 ?
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              No applications found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm ?
                "Try adjusting your search"
              : "No applications match the current filter"}
            </p>
          </div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => (
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

        {/* Pagination */}
        {!loading && applications.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * 10 + 1} -{" "}
              {Math.min(page * 10, applications.length + (page - 1) * 10)} of{" "}
              {stats?.totalApplications || 0}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 text-slate-500 hover:text-[#002677] hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-700">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={applications.length < 10}
                className="p-2 text-slate-500 hover:text-[#002677] hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {showDetails && selectedApp && (
        <ApplicationDetails
          application={selectedApp}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => {
            if (!isProcessing) {
              setShowDetails(false);
              setSelectedApp(null);
            }
          }}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
