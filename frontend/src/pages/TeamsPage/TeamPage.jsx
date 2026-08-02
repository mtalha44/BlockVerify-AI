import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Users,
  Award,
  Code,
  Shield,
  ArrowLeft,
} from "lucide-react";
import NavbarForLinks from "../../components/Header/NavLinksHeader";

const TeamPage = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Muhammad Talha",
      role: "Full Stack Developer",
      bio: "Building secure and scalable blockchain solutions.",
      image: "https://ui-avatars.com/api/?name=Muhammad+Talha&background=002677&color=fff&size=100",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    },
    {
      name: "Ayesha Khan",
      role: "Blockchain Engineer",
      bio: "Smart contract development and blockchain architecture.",
      image: "https://ui-avatars.com/api/?name=Ayesha+Khan&background=002677&color=fff&size=100",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
    },
    {
      name: "Muhees Tariq",
      role: "AI/ML Engineer",
      bio: "OCR and computer vision for certificate verification.",
      image: "https://ui-avatars.com/api/?name=Muhees+Tariq&background=002677&color=fff&size=100",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-8 pt-4 px-4 sm:px-6 lg:px-8">
      {/* Header with Back Button */}
      <NavbarForLinks />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#002677] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>Meet Our Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            The People Behind{" "}
            <span className="text-[#002677]">BlockVerify-AI</span>
          </h2>
          <p className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto">
            We're a team of passionate developers, blockchain engineers, and AI
            specialists working to make certificate verification secure and accessible.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#002677] to-[#1a3a7a] p-1 mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#002677] transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-[#002677] mb-2">
                  {member.role}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 w-full justify-center">
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 rounded-lg hover:bg-[#002677] hover:text-black transition-all duration-300 group-hover:scale-110"
                    >
                      <Github className="w-4 h-4 text-slate-600 group-hover:text-black" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 rounded-lg hover:bg-[#002677] hover:text-black transition-all duration-300 group-hover:scale-110"
                    >
                      <Linkedin className="w-4 h-4 text-slate-600 group-hover:text-black" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 rounded-lg hover:bg-[#002677] hover:text-black transition-all duration-300 group-hover:scale-110"
                    >
                      <Twitter className="w-4 h-4 text-slate-600 group-hover:text-black" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002677]">3+</p>
            <p className="text-xs text-slate-500">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002677]">2+</p>
            <p className="text-xs text-slate-500">Years Building</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002677]">100%</p>
            <p className="text-xs text-slate-500">Commitment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002677]">🔒</p>
            <p className="text-xs text-slate-500">Security First</p>
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-gradient-to-br from-[#002677]/5 to-[#002677]/10 rounded-2xl p-6 border border-[#002677]/10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-3 bg-[#002677]/10 rounded-xl">
              <Code className="w-6 h-6 text-[#002677]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">Built With ❤️</h4>
              <p className="text-xs text-slate-500">
                React • Node.js • Express • MongoDB • Solidity • EasyOCR • Tailwind CSS
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Open Source</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamPage;