import { ShieldCheck, FileSearch, Lock } from "lucide-react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";


const VerifyInfo = [
    {
        icon: <ShieldCheck className="w-5 h-5 text-slate-700" />,
        title: "Blockchain Security",
        description: "Every certificate is stored on blockchain, making records tamper-proof and permanently verifiable."
    },
    {
        icon: <FileSearch className="w-5 h-5 text-slate-700" />,
        title: "OCR Verification",
        description: "Extracts certificate details automatically and compares them with blockchain data for instant verification."
    },
    {
        icon: <Lock className="w-5 h-5 text-slate-700" />,
        title: "Secure Privacy",
        description: "Uploaded files are processed securely and are never shared with unauthorized users."
    }
];

const VerifyInfoSection = () => {
          const [totalVerified, setTotalVerified] = useState(24);
          const [totalRevoked, setTotalRevoked] = useState(2);
          const [integrityScore, setIntegrityScore] = useState(100);

return (
  <section className="max-w-4xl mx-auto mt-18 border-slate-200 mb-8">
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      id="user-stats-container"
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Authentications
          </p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            {totalVerified}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Legit academic matches checked
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Suspended / Revoked Documents
          </p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            {totalRevoked}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tampered or blacklisted files
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Validation Integrity Index
          </p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            {integrityScore}%
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            OCR scanning precision rate
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {VerifyInfo.map((info, index) => (
        <div
          key={index}
          className="space-y-3 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow "
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            {info.icon}
          </div>
          <h5 className="font-bold text-slate-900">{info.title}</h5>
          <p className="text-sm text-slate-500 leading-relaxed">
            {info.description}
          </p>
        </div>
      ))}
    </div>
  </section>
);
}
export default VerifyInfoSection;