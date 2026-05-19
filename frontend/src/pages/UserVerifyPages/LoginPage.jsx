import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Header/Navbar';
import AuthForm from '../../components/forms/Authform';
import { Shield, Lock, Users, FileCheck, FileCode, ScanText, GitBranch, Hash, Clock, ScanSearch } from 'lucide-react';
import BlockCertLogo from '../../components/Header/BlockCertLogo';

const portalFeatures = [
  {
    title: "Role-Based Access",
    description:
      "Different interfaces for Students, Verifiers, and University Admins",
    icon: <Shield className="size-6 text-color-primary" />,
  },
  {
    title: "Military-Grade Security",
    description: "End-to-end encryption and blockchain immutability",
    icon: <Lock className="size-6 text-color-primary" />,
  },
  {
    title: "Instant Verification",
    description: "Verify certificates in under 10 seconds with AI-OCR",
    icon: <FileCheck className="size-6 text-color-primary" />,
  },
  {
    title: "Fraud Detection",
    description: "Detect forged and tampered certificates using AI analysis",
    icon: <ScanSearch className="size-6 text-color-primary" />,
  },
  {
    title: "24/7 Availability",
    description: "Access the platform securely anytime, anywhere",
    icon: <Clock className="size-6 text-color-primary" />,
  },
];


const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-2 min-[985px]:grid-cols-[auto_545px] max-[985px]:grid-cols-1 ">
        <div className="flex items-center flex-col justify-center">
          <div className="bg-white w-full pt-4 pl-8 pr-6 pb-4 border-r border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0 ">
            <BlockCertLogo />
          </div>
          <div className=" w-full mt-8 mb-8 max-w-md max-[1115px]:p-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <AuthForm type="login" />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center bg-white pt-4 pb-4 pl-8 pr-4">
          <div className="desc-part ">
            <div className="mb-7">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 ">
                Secure Certificate Verification
              </h2>
              <p className="text-gray-600">
                Use BlockVerify-AI to verify certificates securely with
                blockchain technology.
              </p>
            </div>
            <div>
              {portalFeatures.map((feature, index) => (
                <div key={index} className="flex items-start mb-4 gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;