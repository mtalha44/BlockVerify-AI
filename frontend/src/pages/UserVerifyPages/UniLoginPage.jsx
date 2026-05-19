import { FileCheck, FileCode, GitBranch, Hash, Lock, ScanText, Shield } from "lucide-react";
import UniversityLogin from "../PageSections/UniversityLogin";

const securityFeatures = [
  {
    title: "SHA-256 Hashing",
    description:
      "Each certificate is secured using SHA-256 hashing to ensure data integrity and tamper-proof records.",
    icon: <Hash className="size-6 text-color-primary" />,

  },
  {
    title: "Merkle Tree Verification",
    description:
      "Efficient batch verification using Merkle Trees for scalable and secure record validation.",
    icon: <GitBranch className="size-6 text-color-primary" />,
  },
  {
    title: "EasyOCR Processing",
    description:
      "AI-powered OCR extracts and validates certificate text with high accuracy.",
    icon: <ScanText className="size-6 text-color-primary" />,
  },
  {
    title: "Smart Contracts",
    description:
      "Blockchain smart contracts provide decentralized and immutable record management.",
    icon: <FileCode className="size-6 text-color-primary" />,
  },
];

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
];

import BlockCertLogo from "../../components/Header/BlockCertLogo";

const UniLoginPage =() => {

    return (
      <div className="verify-user bg-gray-50 min-h-screen grid grid-cols-2 min-[985px]:grid-cols-[530px_auto] max-[985px]:grid-cols-1">
        <div className="left-side bg-white pt-4 pl-8 pr-6 flex flex-col gap-6 border-r border-gray-200 max-[485px]:pr-0 max-[485px]:pl-0 max-[485px]:gap-4">
          <BlockCertLogo />                  
          <div className="title-part flex flex-col text-3xl font-semibold text-color-primary pl-1 max-[485px]:pl-8 max-[485px]:text-2xl">
            <h2>Welcome to One</h2>
            <h2>Blockchain ID</h2>
          </div>
          <div className="min-[985px]:hidden">
            <UniversityLogin />
          </div>
          <div className="img-part h-[45vh] rounded text-white w-full flex items-center justify-end max-[485px]:h-[35vh]">
            <div className="w-[80%] flex flex-col gap-12 pr-3 justify-start">
              <div>
                <span className="font-semibold text-lg">
                  Blockchcain-Based Certificate Verification System using AI OCR
                </span>
                <p className="text-sm text-white/80 mt-2">
                  Verify your certificates with confidence, ease and secure by
                  just login.
                </p>
              </div>
              <button className="py-1.5 px-5 text-md w-fit hover:!text-white text-color-primary bg-white hover:bg-transparent  border-2 border-white rounded">
                Get Started
              </button>
            </div>
          </div>

          <div className="desc-part max-[485px]:pr-6 max-[485px]:pl-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
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
          <div className=" max-[485px]:pr-6 max-[485px]:pl-8 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Security & Technology
              </h2>
              <p className="text-gray-600 mb-7">
                Built with advanced security and blockchain technologies.
              </p>
            </div>
            <div>
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start mt-7 mb-4 gap-3">
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
        <div className="right-side flex flex-col justify-center max-[985px]:hidden">
          <UniversityLogin />
        </div>
      </div>
    );
}


export default UniLoginPage;