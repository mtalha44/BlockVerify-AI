// frontend/src/pages/UserVerifyPages/UniActivation.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  University,
  Check,
} from "lucide-react";
import API from "../../api/axios";
import BlockCertLogo from "../../components/Header/BlockCertLogo";

const UniversityActivation = () => {
  const navigate = useNavigate();

  // Step States
  const [isValidated, setIsValidated] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Other States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [universityInfo, setUniversityInfo] = useState(null);

  // Verify University ID
  const handleVerifyID = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!universityId || universityId.length < 6) {
      setErrorMessage("Please enter a valid University ID");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/verify-university-id", {
        universityId: universityId.toUpperCase(),
      });

      if (res.data.valid) {
        setUniversityInfo(res.data.university);
        setIsValidated(true);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          "Invalid University ID. Please check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Activate Account
  const handleActivate = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await API.post("/auth/activate-university-by-id", {
        universityId: universityId.toUpperCase(),
        password: password,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setIsActivated(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/university-dashboard", { replace: true });
      }, 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  // Password Rules
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

  const infoCards = [
    {
      letter: "A",
      title: "Verify Your University ID",
      desc: "Enter the Institutional Access ID you received in the approval email.",
    },
    {
      letter: "B",
      title: "Set Your Password",
      desc: "Create a strong password to secure your university admin account.",
    },
    {
      letter: "C",
      title: "Start Managing Certificates",
      desc: "Access your dashboard to issue and verify certificates.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white pt-4 pl-8 pr-6 pb-4 border-r flex justify-between border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0">
        <BlockCertLogo />
        <a
          href="/institution-signin"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#002677]"
        >
          <ArrowLeft className="size-4" />
          Back to Portal Login
        </a>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Left Side */}
        <div className="lg:w-5/12 max-w-md w-full space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#002677] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <University className="size-4" />
              University Account Activation
            </div>

            <h1 className="text-3xl font-bold text-[#002677] mb-4">
              Activate Your University Account
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Enter your Institutional Access ID to activate your university
              account and start managing certificates.
            </p>

            <div className="border-t border-slate-100 pt-6 space-y-5">
              {infoCards.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="size-8 rounded-lg bg-blue-50 text-[#002677] flex items-center justify-center font-bold text-xs">
                    {item.letter}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badge */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#002677] rounded-full flex items-center justify-center">
                <KeyRound className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#002677]">
                  Secure Activation
                </p>
                <p className="text-xs text-slate-500">
                  Your University ID is encrypted and verified on blockchain
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 max-w-xl w-full">
          {!isActivated ?
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10">
              {!isValidated ?
                <form onSubmit={handleVerifyID} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="size-16 bg-blue-50 text-[#002677] rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <University className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#002677]">
                      Enter Your University ID
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Enter the Institutional Access ID from your approval email
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Institutional Access ID
                    </label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#002677]" />
                      <input
                        type="text"
                        required
                        value={universityId}
                        onChange={(e) =>
                          setUniversityId(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. INST-1734567890123-ABCDEFGH"
                        className="w-full pl-12 pr-4 h-14 border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none uppercase"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Your University ID was sent to your registered email after
                      admin approval
                    </p>
                    {errorMessage && (
                      <div className="flex items-center gap-2 text-red-500 text-sm mt-3 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="size-4" />
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify University ID"}
                    <ChevronRight className="size-5" />
                  </button>
                </form>
              : <form onSubmit={handleActivate} className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="size-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#002677]">
                      University Verified
                    </h3>
                    {universityInfo && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">
                          <strong>University:</strong> {universityInfo.name}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          <strong>Institution ID:</strong>{" "}
                          <span className="font-mono text-xs">
                            {universityInfo.institutionalAccessId}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Create Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#002677]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 h-14 border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ?
                          <EyeOff className="size-5" />
                        : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#002677]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 h-14 border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none"
                      />
                    </div>
                    {password !== confirmPassword && confirmPassword !== "" && (
                      <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
                        <AlertCircle className="size-4" />
                        <span>Passwords do not match</span>
                      </div>
                    )}
                  </div>

                  {/* Password Strength */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Password Strength
                      </span>
                      <span className="text-xs font-bold text-[#002677]">
                        {Math.round(strengthPercentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-[#002677] transition-all duration-300"
                        style={{ width: `${strengthPercentage}%` }}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      {passwordRequirements.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full transition-all ${
                              item.met ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          ></div>
                          <span
                            className={`text-xs transition-all ${
                              item.met ?
                                "text-emerald-600 font-semibold"
                              : "text-slate-400"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="size-4" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsValidated(false);
                        setUniversityId("");
                      }}
                      className="px-6 h-14 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={
                        strengthPercentage < 100 ||
                        password !== confirmPassword ||
                        loading
                      }
                      className="flex-1 h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                      {loading ? "Activating..." : "Activate Account"}
                      <Sparkles className="size-4" />
                    </button>
                  </div>
                </form>
              }
            </div>
          : /* Success Screen */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 sm:p-12 text-center">
              <div className="size-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="size-10" />
              </div>
              <h2 className="text-3xl font-bold text-[#002677] mb-4">
                Account Activated Successfully!
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Your university account has been activated. Redirecting to
                dashboard...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002677]"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default UniversityActivation;
