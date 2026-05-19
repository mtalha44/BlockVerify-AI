import { useState } from "react";
import {
  Mail,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Shield,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import BlockCertLogo from "../../components/Header/BlockCertLogo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Normally you would call your backend API here
    // For now, just show success message
    setIsSubmitted(true);
  };

  const features = [
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      desc: "Different interfaces for Students, Verifiers, and University Admins",
    },
    {
      icon: Lock,
      title: "Military-Grade Security",
      desc: "End-to-end encryption and blockchain immutability",
    },
    {
      icon: Shield,
      title: "Instant Verification",
      desc: "Verify certificates in under 10 seconds with AI-OCR",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white w-full pt-4 pl-8 pr-6 pb-4 border-b border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0 ">
        <BlockCertLogo />
      </div>
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12">
            {/* Show Form Before Submission */}
            {!isSubmitted ?
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-slate-50 text-[#002677] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="size-8" />
                  </div>

                  <h1 className="text-3xl font-bold text-[#002677] mb-3">
                    Forgot Password?
                  </h1>

                  <p className="text-slate-500 text-sm">
                    No worries, we'll send you reset instructions to your
                    registered email.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />

                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full pl-12 pr-4 h-14 bg-white border border-slate-200 rounded-xl focus:border-[#002677] focus:ring-4 focus:ring-blue-50 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Reset Link</span>
                    <ChevronRight className="size-5" />
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-[#002677] font-semibold text-sm transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            : /* Success Message */
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="size-10" />
                </div>

                <h1 className="text-3xl font-bold text-[#002677] mb-3">
                  Check Your Email
                </h1>

                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  We've sent a password reset link to
                  <br />
                  <span className="font-bold text-slate-700">{email}</span>
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full h-14 bg-[#002677] text-white font-bold rounded-xl hover:bg-[#001b55] transition-all"
                  >
                    Open Email App
                  </button>

                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full h-12 bg-white text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Didn't receive the email?
                    <span className="text-[#002677]"> Click to resend</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-white border-l border-slate-200 p-12 lg:p-20">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-[#002677] mb-6 leading-tight">
              Secure Certificate Verification
            </h2>

            <p className="text-slate-500 text-lg mb-12">
              Use BlockVerify-AI to verify certificates securely with blockchain
              technology.
            </p>

            <div className="space-y-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div key={index} className="flex gap-5">
                    <div className="w-12 h-12 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="size-6" />
                    </div>

                    <div>
                      <h4 className="font-bold text-[#002677]">
                        {feature.title}
                      </h4>

                      <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
