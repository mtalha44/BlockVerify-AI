import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Lock, Cpu, LogIn } from "lucide-react";
import Navbar from "../Header/Navbar";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartVerification = () => {
    // Check if user is logged in
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on user role
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "university") {
          navigate("/university-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // If there's an error parsing, redirect to login
        navigate("/login");
      }
    } else {
      // User is not logged in, redirect to login
      navigate("/login");
    }
  };

  return (
    <section id="Home" className="pt-28 pb-4 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 max-[585px]:mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-color-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="size-4" />
            <span>Trusted by Educational Institutions</span>
          </div>

          <h1 className="hero-title home_page_section">
            Blockchain-Based Certificate
            <br />
            <span className="text-color-primary">Verification System</span>
          </h1>

          <p className="section-description text-xl max-[885px]:text-lg max-[685px]:text-md max-[525px]:text-[17px] max-w-3xl mx-auto mb-10">
            A secure, immutable platform combining AI-OCR and blockchain
            technology for tamper-proof verification of academic credentials.
            Trusted by universities, employers, and verification agencies.
          </p>

          <div className="flex flex-row max-[465px]:flex-col gap-4 justify-center">
            <button
              className="btn-primary px-8 py-3 text-lg max-[685px]:text-[15px] max-[685px]:px-6 max-[685px]:py-2"
              onClick={handleStartVerification}
            >
              Start Verification
            </button>
            <button className="btn-secondary px-8 py-3 text-lg max-[685px]:text-[15px] max-[685px]:px-6 max-[685px]:py-2">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
