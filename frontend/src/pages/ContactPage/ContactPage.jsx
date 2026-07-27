import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  Mail,
  User,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import BlockCertLogo from "../../components/Header/BlockCertLogo";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/contact/contact", formData);

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });

        // Auto redirect after 5 seconds
        setTimeout(() => {
          navigate("/");
        }, 5000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Features data
  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Secure Communication",
      description: "All messages are encrypted and sent securely.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Quick Response",
      description: "We typically respond within 24 hours.",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Professional Support",
      description: "Our team is here to help with any inquiries.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-2 px-4 sm:px-6 lg:px-8">
      {/* Header with Logo */}
      <div className="max-w-6xl pb-2 border-b border-slate-200/80 mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
        <BlockCertLogo />   
        
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-500 hover:text-[#002677] transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Get in Touch
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>

            {success ?
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Message Sent! 🎉
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Thank you for reaching out. We'll get back to you within 24
                  hours.
                </p>
                <p className="text-xs text-slate-500 mt-4">
                  Redirecting to home page...
                </p>
              </motion.div>
            : <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002677]/20 focus:border-[#002677] transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002677]/20 focus:border-[#002677] transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number{" "}
                    <span className="text-slate-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002677]/20 focus:border-[#002677] transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Write your message here..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002677]/20 focus:border-[#002677] transition resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#002677] text-white rounded-xl font-semibold hover:bg-[#001b55] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ?
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  : <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  }
                </button>
              </form>
            }
          </motion.div>

          {/* Right Side - Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Info Card */}
            <div className="bg-gradient-to-br from-[#002677] to-[#1a3a7a] rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Let's Connect</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                We're here to help you with any questions about certificate
                verification, blockchain technology, or our platform.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">support@blockverify-ai.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Response within 24 hours</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">100% Secure & Private</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">
                Why Contact Us?
              </h4>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#002677]/10 rounded-lg text-[#002677] mt-0.5">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {feature.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-around">
              <div className="text-center">
                <p className="text-lg font-bold text-[#002677]">100%</p>
                <p className="text-xs text-slate-500">Secure</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-[#002677]">24/7</p>
                <p className="text-xs text-slate-500">Support</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-[#002677]">5★</p>
                <p className="text-xs text-slate-500">Service</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
