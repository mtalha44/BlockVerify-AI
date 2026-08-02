
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, Upload, ShieldCheck } from "lucide-react";
import API from "../../../../api/axios";

const UploadTab = ({ onTransactionAdd, onStatsUpdate, stats }) => {
  // ← Added stats prop
  const [certificateFile, setCertificateFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG, and PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setCertificateFile(file);
  };

  const handleExtract = async () => {
    if (!certificateFile) return;

    setIsProcessing(true);
    setProcessingStep("Uploading to server...");

    const formData = new FormData();
    formData.append("certificate", certificateFile);

    try {
      setProcessingStep("Processing with OCR...");

      const response = await API.post("/certificates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

if (response.data.success) {
  const data = response.data.data;
  setProcessingStep("✅ Certificate verified and stored on blockchain!");

  // Add transaction
  const newTx = {
    id: `tx-${Date.now()}`,
    student: data.studentName || "Unknown",
    rollNumber: data.registrationNumber || "N/A",
    hash: data.certificateHash || "0x...",
    time: new Date().toLocaleTimeString(),
    type: "Upload",
    status: "Verified",
    degree: data.degree || "N/A",
    gpa: data.cgpa || "N/A",
    gasUsed: "~45,000 Gas",
    blockNumber: data.blockNumber || 0,
  };
  onTransactionAdd(newTx);

  // ✅ FIX: Pass actual numbers (not functions)
  onStatsUpdate({
    totalTxs: stats.totalTxs + 1,
    recordsStored: stats.recordsStored + 1,
    verifiedStudents: stats.verifiedStudents + 1,
  });

  setCertificateFile(null);
  setTimeout(() => {
    setIsProcessing(false);
    setProcessingStep("");
  }, 2000);
} else {
  setProcessingStep("❌ Error: " + response.data.message);
  setTimeout(() => setIsProcessing(false), 3000);
}
    } catch (error) {
      console.error("Upload error:", error);
      setProcessingStep(
        "❌ Error: " + (error.response?.data?.message || error.message),
      );
      setTimeout(() => setIsProcessing(false), 3000);
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
      <div className="lg:col-span-5 bg-[#002677]/2 border border-blue-105 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#002677] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Methodology 01
          </span>
          <h3 className="text-xl font-bold text-[#002677] mt-3">
            Single On-Chain Issuance Guide
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Designed for deploying student degrees individually. This action
            performs an instant OCR layout scanning sequence, generates a
            cryptographical content certificate, and broadcasts an immutable
            block state trace.
          </p>

          <div className="space-y-4 mt-6">
            {[
              "Drag/Select Transcript Document",
              "Dynamic OCR Extraction",
              "Compute SHA-256 State",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{step}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {i === 0 &&
                      "Supports raw certificate images or academic PDF receipts."}
                    {i === 1 &&
                      "Our smart layout scanner isolates Roll indexes, name tokens."}
                    {i === 2 &&
                      "A secure 256-bit cryptographic signature blocks manipulations."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-[#002677] font-semibold bg-[#002677]/[0.04] p-3.5 rounded-xl border border-[#002677]/10">
          <Info className="w-4 h-4 text-[#002677] shrink-0" />
          <span>Cost parameter: ~42,000 transaction Gas units</span>
        </div>
      </div>

      {/* Upload Widget */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Upload & Hashing Protocol
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                Single credential broadcast system
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Select or drop the student's physical transcript image. On clicking,
            simulated nodes process metadata and link block values dynamically.
          </p>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-[#002677] bg-slate-50/50 rounded-xl p-6 sm:p-8 transition-all text-center group cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,image/*"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-all text-slate-400 group-hover:text-[#002677]">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-800">
                {certificateFile ?
                  certificateFile.name
                : "Drag & Drop PDF or Click to upload"}
              </p>
              <p className="text-[10px] text-slate-400">
                PDF, PNG, JPG format (Max size: 5MB)
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
                className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-105 flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-xs font-bold text-[#002677] animate-pulse">
                    Transmitting To Block Ledger...
                  </span>
                  <div className="w-4 h-4 border-2 border-[#002677] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[11px] font-mono text-slate-600 leading-snug">
                  → {processingStep}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File ready */}
          {!isProcessing && certificateFile && (
            <div className="mt-5 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 select-none shrink-0">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-green-850 truncate">
                  {certificateFile.name}
                </p>
                <p className="text-[10px] text-green-600 font-semibold">
                  Ready for cryptographic hashing sequence
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleExtract}
          disabled={!certificateFile || isProcessing}
          className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
            certificateFile && !isProcessing ?
              "bg-[#002677] text-white hover:bg-[#00174a] shadow-lg shadow-blue-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Extract & Store Hash</span>
        </button>
      </div>
    </motion.div>
  );
};

export default UploadTab;
