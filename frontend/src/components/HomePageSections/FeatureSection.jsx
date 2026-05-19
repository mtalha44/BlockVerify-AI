import React from 'react';
import { Shield, Cpu, Clock, FileCheck, Lock, Users, File, CpuIcon } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Blockchain Immutability',
      description: 'Certificate hashes stored on Ethereum blockchain ensure permanent, tamper-proof verification records.',
      stats: '100% Tamper-Proof'
    },
    {
      icon: Cpu,
      title: 'AI-Powered OCR',
      description: 'Advanced EasyOCR technology extracts certificate details with 90%+ accuracy across various formats.',
      stats: '90%+ Accuracy'
    },
    {
      icon: Clock,
      title: 'Rapid Verification',
      description: 'Complete verification cycle in under 10 seconds – from upload to blockchain confirmation.',
      stats: '< 10s Process'
    },
    {
      icon: FileCheck,
      title: 'Smart Contract Automation',
      description: 'Automated verification logic through Ethereum smart contracts eliminates manual intervention.',
      stats: 'Auto-Verification'
    },
    {
      icon: Lock,
      title: 'Military-Grade Security',
      description: 'SHA-256 cryptographic hashing and role-based access control ensure maximum security.',
      stats: 'Enterprise Security'
    },
    {
      icon: Users,
      title: 'Multi-Role Platform',
      description: 'Separate interfaces for Students, Verifiers, and University Administrators.',
      stats: 'Role-Based Access'
    }
  ];

  return (
    <section id='Features' className="py-4 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-color-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CpuIcon className="size-4" />
            <span>Core Technology Features</span>
          </div>

          <h2 className="font-bold text-gray-900 home_page_section">
            Advanced Certificate Verification
            <br />
            <span className="block text-color-primary">
              Powered by Blockchain & AI
            </span>
          </h2>

          <p className="text-xl max-[885px]:text-lg max-[685px]:text-md max-[525px]:text-[17px] text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge technologies to deliver a
            seamless, secure, and efficient certificate verification experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
              >
                {/* Icon with gradient background */}
                <div className="mb-6 max-[585px]:mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 max-[585px]:w-12 max-[585px]:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                    <Icon className="size-5 md:size-7 text-color-primary" />
                  </div>
                </div>

                {/* Feature Stats */}
                <div className="inline-block bg-blue-50 text-color-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {feature.stats}
                </div>

                {/* Feature Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-color-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="text-gray-600 mb-6">{feature.description}</p>

                {/* Learn More Link */}
                <a
                  href="#learn-more"
                  className="inline-flex items-center text-color-primary hover:text-blue-800 font-medium text-sm group-hover:gap-2 transition-all"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;