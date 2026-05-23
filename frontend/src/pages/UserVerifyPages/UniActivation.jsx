import { useState } from "react";
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
  Database,
  Check,
} from "lucide-react";
import BlockCertLogo from "../../components/Header/BlockCertLogo";

const UniversityActivation = () => {
  // Step States
  const [isValidated, setIsValidated] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const [isPassMatch, setPassNotMatch] = useState(false);

  // Form States
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Other States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verify University ID
  const handleVerifyID = (e) => {
    e.preventDefault();

    if (universityId.trim().length < 6) {
      setErrorMessage("University ID must be at least 6 characters.");
      return;
    }

    setErrorMessage("");
    setIsValidated(true);
  };

  // Activate Account
  const handleActivate = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    setIsActivated(true);
  };

  // Password Rules
  const passwordRequirements = [
    {
      label: "Minimum 8 characters",
      met: password.length >= 8,
    },
    {
      label: "At least one number",
      met: /\d/.test(password),
    },
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  // Password Strength
  const strengthPercentage =
    (passwordRequirements.filter((item) => item.met).length /
      passwordRequirements.length) *
    100;

  // Left Side Cards Data
  const infoCards = [
    {
      letter: "A",
      title: "Audit Check",
      desc: "The system checks your university records and verifies the institution ID securely.",
    },
    {
      letter: "B",
      title: "Keys Generation",
      desc: "Your password creates secure blockchain-based authentication keys.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white  pt-4 pl-8 pr-6 pb-4 border-r flex justify-between border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0 ">
        <BlockCertLogo />
        <a
          href="/institution-signin"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#002677]"
        >
          <ArrowLeft className="size-4" />
          Back to Portal Login
        </a>
      </div>

      {/* Main Section */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Left Side */}
        <div className="lg:w-5/12 max-w-md w-full space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#002677] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <KeyRound className="size-4" />
              Institutional Keys Activation
            </div>

            <h1 className="text-3xl font-bold text-[#002677] mb-4">
              Activate Your Campus Admin Account
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Use the University Login ID sent to your official email to
              activate your university account.
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
        </div>

        {/* Right Side */}
        <div className="flex-1 max-w-xl w-full">
          {!isActivated ?
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10">
              {/* Step 1 */}
              {!isValidated ?
                <form onSubmit={handleVerifyID} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="size-16 bg-blue-50 text-[#002677] rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Database className="size-7" />
                    </div>

                    <h2 className="text-2xl font-bold text-[#002677]">
                      Enter University Login ID
                    </h2>

                    <p className="text-slate-400 text-sm mt-2">
                      Enter your activation ID.
                    </p>
                  </div>

                  {/* Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      University Activation ID
                    </label>

                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#002677]" />

                      <input
                        type="text"
                        required
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        placeholder="e.g. UNI-GGCS-2026"
                        className="w-full pl-12 pr-4 h-14 border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none"
                      />
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                        <AlertCircle className="size-4" />
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] transition-all flex items-center justify-center gap-2"
                  >
                    Verify Institution ID
                    <ChevronRight className="size-5" />
                  </button>
                </form>
              : /* Step 2 */
                <form onSubmit={handleActivate} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#002677] flex items-center gap-2">
                      <span className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="size-4" />
                      </span>
                      ID Verified
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Institution ID:{" "}
                      <span className="font-bold">
                        {universityId.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      New Password
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
                  </div>

                  {/* Password Rules */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Password Strength
                      </span>

                      <span className="text-xs font-bold text-[#002677]">
                        {strengthPercentage}%
                      </span>
                    </div>

                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-[#002677]"
                        style={{
                          width: `${strengthPercentage}%`,
                        }}
                      ></div>
                    </div>

                    <div className="space-y-2">
                      {passwordRequirements.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${
                              item.met ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          ></div>

                          <span
                            className={`text-xs ${
                              item.met ? "text-emerald-600" : "text-slate-400"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsValidated(false)}
                      className="px-6 h-14 border border-slate-200 rounded-xl font-semibold"
                    >
                      Reset
                    </button>

                    <button
                      type="submit"
                      disabled={
                        strengthPercentage < 100 || password !== confirmPassword
                      }
                      className="flex-1 h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      Activate Account
                      <Sparkles className="size-4" />
                    </button>
                  </div>
                </form>
              }
            </div>
          : /* Success Screen */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 sm:p-12 text-center">
              <div className="size-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="size-10" />
              </div>

              <h2 className="text-3xl font-bold text-[#002677] mb-4">
                Account Activated!
              </h2>

              <p className="text-slate-500 text-sm mb-8">
                Your university account has been successfully activated.
              </p>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 max-w-sm mx-auto mb-8 text-left">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Authenticated Node
                </p>

                <h4 className="font-bold text-[#002677] mt-2">
                  {universityId.toUpperCase()}
                </h4>

                <p className="text-sm text-emerald-500 font-semibold mt-2">
                  Status: Active
                </p>
              </div>

              <button className="w-full h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] flex items-center justify-center gap-2">
                Go to University Sign In
                <ChevronRight className="size-5" />
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default UniversityActivation;
