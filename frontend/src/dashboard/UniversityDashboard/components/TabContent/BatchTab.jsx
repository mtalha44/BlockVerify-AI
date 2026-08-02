
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, Upload, FileSpreadsheet } from "lucide-react";
import API from "../../../../api/axios";

const BatchTab = ({ onTransactionAdd, onStatsUpdate, stats }) => {
  // ← Added stats prop
  const [excelFile, setExcelFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!excelFile) {
      alert("Please select an Excel file first.");
      return;
    }

    const validTypes = [".xlsx", ".xls", ".csv"];
    const fileExt = excelFile.name
      .substring(excelFile.name.lastIndexOf("."))
      .toLowerCase();
    if (!validTypes.includes(fileExt)) {
      alert("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Validating file...");

    const formData = new FormData();
    formData.append("excel", excelFile);

    try {
      setProcessingStep("Processing spreadsheet...");

      const response = await API.post("/certificates/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });

      if (response.data.success) {
        const results = response.data.results || [];
        const errors = response.data.errors || [];
          // const successCount = response.data.savedCount || 0;
        const merkleRoot = response.data.merkleRoot;

        setProcessingStep(
          `✅ ${response.data.savedCount} certificates imported! Merkle Root: ${merkleRoot?.substring(0, 16)}...`,
        );

        // Add transactions
        results.forEach((cert) => {
          const newTx = {
            id: `tx-batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            student: cert.studentName || "Unknown",
            rollNumber: cert.registrationNumber || "N/A",
            hash: cert.certificateHash || "0x...",
            time: new Date().toLocaleTimeString(),
            type: "Batch Import",
            status: "Verified",
            degree: "Multiple",
            gasUsed: "~120,000 Gas",
            blockNumber: response.data.blockNumber || 0,
            batch: true,
            merkleRoot: merkleRoot,
          };
          onTransactionAdd(newTx);
        });

        // ✅ FIX: Use stats from props
        const successCount = response.data.savedCount || 0;
        if (successCount > 0) {
          onStatsUpdate({
            totalTxs: stats.totalTxs + 1,
            recordsStored: stats.recordsStored + successCount,
            verifiedStudents: stats.verifiedStudents + successCount,
          });
        }

        setExcelFile(null);
      } else {
        setProcessingStep(
          "❌ Error: " + (response.data.message || "Import failed"),
        );
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      setProcessingStep(
        "❌ Error: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        if (!processingStep.includes("✅") && !processingStep.includes("❌")) {
          setProcessingStep("");
        }
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
    >
      {/* Info Sidebar */}
      <div className="lg:col-span-5 bg-emerald-50/[0.04] border border-emerald-105 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Methodology 02
          </span>
          <h3 className="text-xl font-bold text-emerald-800 mt-3">
            Batch Register Protocol Specs
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Optimize deployment speeds using spreadsheets. Ideal for publishing
            batch records for entire graduation sets, saving up to 80% on
            transactional decentralized system overhead.
          </p>

          <div className="space-y-4 mt-6">
            {[
              "CSV Structure Layout",
              "Merkle Tree Compilation",
              "Consolidated Block Write",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{step}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {i === 0 &&
                      "Form sheet columns mapping student identities and roll codes."}
                    {i === 1 &&
                      "Aggregates batch arrays into a single high-integrity root checkpoint."}
                    {i === 2 &&
                      "Launches multi-tier verifications across a single Smart Contract command."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-500/10">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Calculated throughput limit: 1,000 blocks per transaction trigger
          </span>
        </div>
      </div>

      {/* Upload Widget */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Batch Spreadsheet Enrollment
              </h4>
              <p className="text-xs text-slate-400 font-medium font-mono">
                Bulk batch node ingestion
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Publish lists of graduating students. Provide a list with Name, Roll
            Number, and Degree variables.
          </p>

          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 bg-slate-50/50 rounded-xl p-6 sm:p-8 transition-all text-center group cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv,.xls,.xlsx"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-all text-slate-400 group-hover:text-emerald-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-800">
                {excelFile ?
                  excelFile.name
                : "Choose Batch spreadsheet (.csv, .xlsx)"}
              </p>
              <p className="text-[10px] text-slate-400">
                Excel tables with Name/Roll columns
              </p>
            </div>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-xs font-bold text-emerald-800 animate-pulse">
                    Hashing Batch Array Root...
                  </span>
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[11px] font-mono text-emerald-700 leading-snug">
                  → {processingStep}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File ready */}
          {!isProcessing && excelFile && (
            <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 select-none shrink-0">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-850 truncate">
                  {excelFile.name}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  Ready to digest multi-line array rows
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleImport}
          disabled={!excelFile || isProcessing}
          className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
            excelFile && !isProcessing ?
              "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Publish Batch Records</span>
        </button>
      </div>
    </motion.div>
  );
};

export default BatchTab;
