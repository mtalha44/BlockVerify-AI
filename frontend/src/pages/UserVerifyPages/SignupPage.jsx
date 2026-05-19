import React from 'react';
import { Link } from "react-router-dom";
import Navbar from '../../components/Header/Navbar';
import AuthForm from '../../components/forms/Authform';
import { Shield, Users, Building, GraduationCap, Briefcase } from 'lucide-react';
import BlockCertLogo from '../../components/Header/BlockCertLogo';

const SignupPage = () => {
  return (
    <div className="mx-auto min-h-screen bg-gray-50">
      {/* <div className="grid grid-cols-2 min-[985px]:grid-cols-[545px_auto] max-[985px]:grid-cols-1 "> */}
      <div className="grid grid-cols-2 min-[985px]:grid-cols-[auto_555px] max-[985px]:grid-cols-1 ">
        <div>
          <div className="bg-white  pt-4 pl-8 pr-6 pb-4 border-r border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0 ">
            <BlockCertLogo />
          </div>
          <div className="flex items-center justify-center flex-col mt-8 mb-8">
            <div className="w-full max-w-md max-[495px]:p-3">
              <div className="bg-white flex rounded-xl shadow-sm border border-gray-200 p-8 max-[495px]:p-4">
                <AuthForm type="signup" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center text-white p-6 signup-right-side">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Join BlockVerify-AI
              </h2>
              <p className="text-white/70">
                Register for an account to access tamper-proof certificate
                verification powered by blockchain and AI technology.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white/90 text-lg">
                Choose Your Role
              </h3>

              <div className="grid grid-cols-3 gap-4 max-[1065px]:grid-cols-2 max-[495px]:grid-cols-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <GraduationCap className="size-5 text-color-primary" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Student</h4>
                  </div>
                  <p className="text-sm text-gray-600 pl-1">
                    Verify your certificates and share with employers
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Briefcase className="size-5 text-color-primary" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Verifier</h4>
                  </div>
                  <p className="text-sm text-gray-600 pl-1">
                    HR professionals and employers verifying credentials
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Building className="size-5 text-color-primary" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Admin</h4>
                  </div>
                  <p className="text-sm text-gray-600 pl-1">
                    University administrators managing certificates
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h3 className="font-semibold text-color-primary mb-3">
                Why Join BlockVerify-AI?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Blockchain-immutable certificate storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>90%+ AI-OCR accuracy for automatic extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Under 10-second verification process</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Role-based access control for security</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Comprehensive audit trails and logs</span>
                </li>
              </ul>
            </div>

            {/* Already have account */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-300">
                Already verified your institution?{" "}
                <Link
                  to="/institution-setup"
                  className="text-blue-300 hover:text-blue-800 font-medium"
                >
                  Contact us for enterprise setup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;