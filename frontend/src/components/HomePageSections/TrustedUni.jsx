import { Shield, CheckCircle, Building, Users, Clock, Lock, Award, Database, Globe, Zap, Activity, University, UniversityIcon } from 'lucide-react';

const TrustAndStats = () => {
  const institutions = [
    {
      name: "The Higher Education Commission",
      desc: "Primary technology and regulatory partner ensuring secure integration, data standards, and nationwide academic verification support.",
      shortName: "hec",
    },
    {
      name: "Punjab University",
      desc: "Leading academic partner providing verified degree records and enabling seamless digital certificate validation for students and institutions.",
      shortName: "pu1",
    },
    {
      name: "Govt. Science College",
      desc: "Enterprise-level partner contributing institutional data and supporting real-time verification of academic credentials through the platform.",
      shortName: "gcs",
    },
    {
      name: "Education Board",
      desc: "Government partner responsible for maintaining academic records and facilitating secure, transparent verification of certificates at scale.",
      shortName: "eb",
    },
  ];


  return (
    <section className="pt-14 px-4 bg-gradient-to-b ">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-color-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <UniversityIcon className="size-5" />
            <span>Trusted by Leading Institutions</span>
          </div>

          <h2 className="home_page_section font-bold text-color-primary  mb-6">
            Built on
            <span className="text-gray-900"> Trust & Excellence </span>
          </h2>

          <p className="text-xl max-[885px]:text-lg max-[685px]:text-md max-[525px]:text-[17px] text-gray-600 max-w-3xl mx-auto">
            Partnering with top educational institutions to revolutionize
            certificate verification through blockchain technology and AI-driven
            accuracy.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-8 max-[765px]:grid-cols-1 ">
          {institutions.map((inst, index) => (
            <div
              key={index}
              className="flex mb-3 gap-4 justify-end border-2 rounded-4xl p-4 border-gray-100 max-[465px]:flex-col hover:shadow-lg transition-all duration-300"
            >
              <div className="w-28 h-28 max-[465px]:w-16 max-[465px]:h-16">
                <img src={`../../images/${inst.shortName}.png`} alt="" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{inst.name}</h4>
                <p className="text-gray-500 text-[15px]">{inst.desc}</p>
                <div className="flex text-color-primary items-center gap-0.5 mt-4">
                  <Award className="size-4" />
                  <span className="text-sm">Verified Partner</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustAndStats;