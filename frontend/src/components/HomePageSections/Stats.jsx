import { ActivityIcon, Building, Database, Globe, Lock, Shield, Users, Zap } from "lucide-react";

const stats = [
  {
    title: "Verified Certificates",
    value: "2.8M+",
    description: "Certificates successfully verified on blockchain.",
    icon: <Shield className="size-5 text-color-primary" />,
  },
  {
    title: "Network Nodes",
    value: "142",
    description: "Blockchain nodes running worldwide.",
    icon: <Globe className="size-5 text-color-primary" />,
  },
  {
    title: "Verification Time",
    value: "1.2s",
    description: "Average time to verify one certificate.",
    icon: <Zap className="size-5 text-color-primary" />,
  },
  {
    title: "Partner Universities",
    value: "850+",
    description: "Universities and institutions connected.",
    icon: <Building className="size-5 text-color-primary" />,
  },
];

const StatSection = () => {

return (
  <section className="px-4 mt-12 mb-12 bg-gradient-to-b ">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-color-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <ActivityIcon className="w-4 h-4" />
          Live Network Metrics
        </div>

        <h2 className="home_page_section hero-title">
          Powering Trust at a Global Scale
        </h2>

        <p className="section-description text-xl max-[885px]:text-lg max-[685px]:text-md max-[525px]:text-[17px] max-w-3xl mx-auto mb-10">
          Real-time statistics showing the strength and reliability of our
          blockchain-based certificate verification system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                {stat.icon}
              </div>

              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                {stat.value}
              </h3>

              <h4 className="text-sm font-bold text-slate-900 mb-2">
                {stat.title}
              </h4>

              <p className="text-sm text-slate-500 leading-relaxed">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          System Status: Operational
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
        {[
          { icon: Shield, label: "Blockchain Verified" },
          { icon: Database, label: "AI-Powered OCR" },
          { icon: Users, label: "Multi-tenant" },
          { icon: Lock, label: "End-to-end Encrypted" },
        ].map((badge, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="bg-blue-50 p-2 rounded-lg">
              <badge.icon className="size-5 text-color-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="bg-linear-to-r text-color-white custom-btn  text-white font-semibold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          Become a Partner Institution
        </button>
        <p className="text-gray-500 text-sm mt-4">
          Join our network of trusted educational institutions
        </p>
      </div>
    </div>
  </section>
);
}

export default StatSection;