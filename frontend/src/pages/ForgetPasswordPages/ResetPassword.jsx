// frontend/src/pages/ForgetPasswordPages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import API from "../../api/axios";
import BlockCertLogo from "../../components/Header/BlockCertLogo";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [verifying, setVerifying] = useState(true);

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setVerifying(false);
        setErrorMessage("No reset token provided");
        return;
      }

      try {
        await API.get(`/password/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        setErrorMessage(
          error.response?.data?.message || "Invalid or expired reset token",
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      await API.post("/password/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to reset password",
      );
    } finally {
      setLoading(false);
    }
  };

  // Password Requirements
  const passwordRequirements = [
    { label: "Minimum 8 characters", met: password.length >= 8 },
    { label: "At least one number", met: /\d/.test(password) },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    {
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const strengthPercentage =
    (passwordRequirements.filter((item) => item.met).length /
      passwordRequirements.length) *
    100;

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <div className="bg-white pt-4 pl-8 pr-6 pb-4 border-r justify-between border-gray-200">
          <BlockCertLogo />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002677] mx-auto mb-4"></div>
            <p className="text-slate-500">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <div className="bg-white pt-4 pl-8 pr-6 pb-4 border-r justify-between border-gray-200">
          <BlockCertLogo />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="size-10" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-3">
              Invalid Reset Link
            </h1>
            <p className="text-slate-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full h-14 bg-[#002677] text-white rounded-xl font-bold hover:bg-[#001b55] transition-all"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white pt-4 pl-8 pr-6 pb-4 border-r justify-between border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0">
        <BlockCertLogo />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-12">
            {!isSuccess ?
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 text-[#002677] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="size-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#002677] mb-3">
                    Set New Password
                  </h1>
                  <p className="text-sm text-slate-500">
                    Establish a strong password to protect your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#002677] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-14 pl-12 pr-12 border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ?
                          <EyeOff className="size-5" />
                        : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#002677] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-14 pl-12 pr-4 border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      />
                    </div>
                    {password !== confirmPassword && confirmPassword !== "" && (
                      <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
                        <AlertCircle className="size-4" />
                        <span>Passwords do not match</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
                      Security Requirements
                    </p>
                    {passwordRequirements.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className={`size-1.5 rounded-full ${item.met ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></div>
                        <span
                          className={`text-xs ${item.met ? "text-emerald-600 font-semibold" : "text-slate-500"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      password !== confirmPassword ||
                      password.length < 8 ||
                      loading
                    }
                    className="w-full h-14 bg-[#002677] text-white rounded-xl font-bold hover:bg-[#001b55] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Update Password"}
                    <ChevronRight className="size-5" />
                  </button>
                </form>
              </>
            : <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="size-10" />
                </div>
                <h1 className="text-3xl font-bold text-[#002677] mb-3">
                  Password Updated
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                  Your password has been successfully reset.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-14 bg-[#002677] text-white rounded-xl font-bold hover:bg-[#001b55] transition-all"
                >
                  Return to Login
                </button>
              </div>
            }
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-white border-l border-slate-200 items-center justify-center p-20">
          <div className="max-w-md w-full">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-blue-50 rounded-[4rem] rotate-6 scale-110 opacity-50 blur-3xl"></div>
              <div className="relative bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Lock className="text-white size-6" />
                  </div>
                  <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-full bg-slate-50 rounded-full"></div>
                  <div className="h-3 w-3/4 bg-slate-50 rounded-full"></div>
                  <div className="h-10 w-full bg-blue-50 rounded-xl border border-blue-100 mt-6"></div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#002677] mb-4">
              Fortified Security
            </h2>
            <p className="text-slate-500 leading-relaxed">
              BlockVerify-AI uses enterprise-level security protocols to protect
              your account and credentials.
            </p>
            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-6 opacity-60">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Encrypted Session
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                L2 Auth Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
