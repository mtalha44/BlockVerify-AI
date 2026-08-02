import { ShieldCheck, Files, FileSpreadsheet, Ban } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "upload", label: "Single Issuance Hub", icon: ShieldCheck },
    { id: "bulk-docs", label: "Bulk Files Hub", icon: Files },
    { id: "batch", label: "Batch Register Ledger", icon: FileSpreadsheet },
    { id: "revoke", label: "Revocation Integrity Center", icon: Ban },
  ];

  const getTabStyles = (tabId) => {
    const base =
      "flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all";

    if (activeTab === tabId) {
      if (tabId === "batch") {
        return `${base} bg-emerald-700 text-white shadow-md shadow-emerald-950/15`;
      }
      if (tabId === "revoke") {
        return `${base} bg-red-600 text-white shadow-md shadow-red-950/15`;
      }
      return `${base} bg-[#002677] text-white shadow-md shadow-blue-900/15`;
    }

    return `${base} text-slate-600 hover:text-slate-950 hover:bg-slate-50/70`;
  };

  return (
    <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={getTabStyles(tab.id)}
        >
          <tab.icon className="w-4.5 h-4.5" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
