import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";

// Hooks
import { useDashboardData } from "./hooks/useDashboardData";

// Components
import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import TabNavigation from "./components/TabNavigation";
import UploadTab from "./components/TabContent/UploadTab";
import BulkDocsTab from "./components/TabContent/BulkDocsTab";
import BatchTab from "./components/TabContent/BatchTab";
import RevokeTab from "./components/TabContent/RevokeTab";
import TransactionTable from "./components/TransactionTable";
import TransactionModal from "./components/TransactionModal";
import FooterBanner from "./components/FooterBanner";

import API from "../../api/axios";

const UniversityDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedTx, setSelectedTx] = useState(null);

  // Use custom hook for data management
  const {
    stats,
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    updateStats,
    refreshData,
  } = useDashboardData();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      localStorage.removeItem("user");
      navigate("/institution-signin", { replace: true });
    }
  };

  // Wrapper functions to match component props
  const handleTransactionAdd = (newTx) => {
    addTransaction(newTx);
  };

  const handleTransactionUpdate = (hash, updates) => {
    updateTransaction(hash, updates);
  };

  const handleStatsUpdate = (updates) => {
    updateStats(updates);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#002677] selection:text-white">
      {/* Header */}
      <DashboardHeader onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-100">
          <AnimatePresence mode="wait">
            {activeTab === "upload" && (
              <UploadTab
                key="upload"
                stats={stats} // ← Make sure this is passed
                onTransactionAdd={handleTransactionAdd}
                onStatsUpdate={handleStatsUpdate}
              />
            )}
            {activeTab === "bulk-docs" && (
              <BulkDocsTab
                key="bulk-docs"
                stats={stats}
                onTransactionAdd={handleTransactionAdd}
                onStatsUpdate={handleStatsUpdate}
              />
            )}
            {activeTab === "batch" && (
              <BatchTab
                key="batch"
                stats={stats}
                onTransactionAdd={handleTransactionAdd}
                onStatsUpdate={handleStatsUpdate}
              />
            )}
            {activeTab === "revoke" && (
              <RevokeTab
                key="revoke"
                stats={stats}
                onTransactionUpdate={handleTransactionUpdate}
                onStatsUpdate={handleStatsUpdate}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Transaction Table */}
        <TransactionTable
          transactions={transactions}
          onRowClick={setSelectedTx}
        />

        {/* Footer Banner */}
        <FooterBanner />
      </main>

      {/* Transaction Modal */}
      <AnimatePresence>
        {selectedTx && (
          <TransactionModal
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniversityDashboard;
