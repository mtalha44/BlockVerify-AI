import { Building2, LogOut } from "lucide-react";
import BlockCertLogo from "../../../components/Header/BlockCertLogo";

const DashboardHeader = ({ onLogout }) => {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <BlockCertLogo />
        </div>

        <div className="hidden sm:block h-8 w-px bg-slate-200" />

        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-[#002677] flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>University Dashboard</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Verification Portal
          </p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-all border border-slate-200"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default DashboardHeader;
