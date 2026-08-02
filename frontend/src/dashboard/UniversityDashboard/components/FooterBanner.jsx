import { Database } from "lucide-react";

const FooterBanner = () => {
  return (
    <div className="bg-[#002677] rounded-2xl p-6 text-white shadow-[#002677]/10 shadow-xl border border-[#001c59]">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
          <Database className="w-6 h-6 text-blue-200" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
            <span>Secure Decentralized Blockchain Storage Enabled</span>
            <span className="text-[10px] bg-sky-500 text-white font-extrabold px-2 py-0.5 rounded-full">
              No Primary DB Required to Verify
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed md:max-w-4xl">
            This verification portal is designed to prevent systemic credentials
            forgery. When transcripts are stored, they bypass standard databases
            for queries; rather, the hashed content is written directly inside a
            decentralized immutable Merkle Tree. Inquirers can immediately
            cross-match a transcript block root without storing physical student
            identities, preserving student database anonymity, and upholding
            structural educational integrity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterBanner;
