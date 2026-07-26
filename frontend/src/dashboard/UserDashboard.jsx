import { Building2, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlockCertLogo from "../components/Header/BlockCertLogo";
import CertificateUpload from "../pages/UploadCertificate/UploadPage";
import API from "../api/axios";
import { useEffect, useState } from "react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        console.log("User data in dashboard:", JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <main>
      <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <BlockCertLogo />
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-[#002677] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Employer & Student Dashboard</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Verification Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-600 hidden sm:block">
              Welcome, {user.fullName || user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-all border border-slate-200"
            id="btn-logout"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <CertificateUpload />
    </main>
  );
};

export default UserDashboard;
