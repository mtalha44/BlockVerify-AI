
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, Upload, Files, FileText, X } from "lucide-react";
import API from "../../../../api/axios";

const BulkDocsTab = ({ onTransactionAdd, onStatsUpdate, stats }) => {
  // ← Added stats prop
  const [bulkFiles, setBulkFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
  });

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter((file) => {
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "application/pdf",
        ];
        if (!allowedTypes.includes(file.type)) return false;
        if (file.size > 10 * 1024 * 1024) return false;
        return true;
      });

      if (validFiles.length === 0) {
        alert(
          "No valid files selected. Please upload PNG, JPG, JPEG, or PDF files under 10MB.",
        );
        return;
      }

      setBulkFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setBulkFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (bulkFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    if (bulkFiles.length > 50) {
      alert("Maximum 50 files allowed per batch.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep(`Preparing ${bulkFiles.length} files...`);

    const formData = new FormData();
    bulkFiles.forEach((file) => formData.append("certificates", file));

    try {
      setProcessingStep(`Uploading ${bulkFiles.length} files to server...`);

      const response = await API.post("/certificates/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });

      if (response.data.success) {
        const results = response.data.results || [];
        const errors = response.data.errors || [];
        // const successCount = results.length;

        setProgress({
          total: bulkFiles.length,
          processed: results.length + errors.length,
          succeeded: results.length,
          failed: errors.length,
        });

        setProcessingStep(
          `✅ ${results.length} certificates processed successfully!`,
        );

        // Add transactions
        results.forEach((cert) => {
          const newTx = {
            id: `tx-bulk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            student: cert.studentName || "Unknown",
            rollNumber: cert.registrationNumber || "N/A",
            hash: cert.certificateHash || "0x...",
            time: new Date().toLocaleTimeString(),
            type: "Bulk Import",
            status: "Verified",
            degree: cert.degree || "N/A",
            gasUsed: "~45,000 Gas",
            blockNumber: cert.blockNumber || 0,
          };
          onTransactionAdd(newTx);
        });

        // ✅ FIX: Use stats from props
        const successCount = results.length;
        if (successCount > 0) {
          onStatsUpdate({
            totalTxs: stats.totalTxs + successCount,
            recordsStored: stats.recordsStored + successCount,
            verifiedStudents: stats.verifiedStudents + successCount,
          });
        }

        setBulkFiles([]);
        setTimeout(() => {
          setProgress({ total: 0, processed: 0, succeeded: 0, failed: 0 });
        }, 5000);
      } else {
        setProcessingStep(
          "❌ Error: " + (response.data.message || "Upload failed"),
        );
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      let errorMsg = error.response?.data?.message || error.message;
      if (errorMsg.includes("too many files"))
        errorMsg = "Too many files. Maximum 50 files per batch.";
      if (errorMsg.includes("file too large"))
        errorMsg = "One or more files exceed the 10MB limit.";
      setProcessingStep("❌ Error: " + errorMsg);
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
      <div className="lg:col-span-5 bg-[#002677]/[0.02] border border-[#002677]/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#002677] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Methodology 01-B
          </span>
          <h3 className="text-xl font-bold text-[#002677] mt-3">
            Bulk Certificate Ingestion Specs
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Mass digest physical certificates (images and PDF files) in a single
            workflow. Our engine executes parallel OCR threads to hash roll
            identifiers.
          </p>

          <div className="space-y-4 mt-6">
            {[
              "Select Multiple Certificate Docs",
              "Concurrent OCR Mapping",
              "Commit Ledger Tree",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002677]/10 flex items-center justify-center text-xs font-bold text-[#002677] shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{step}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {i === 0 &&
                      "Drag and drop or select multiple PDF/PNG/JPEG transcripts."}
                    {i === 1 &&
                      "The scanner parses key variables for each file concurrently."}
                    {i === 2 &&
                      "Hashed credentials are wrapped inside a secure block transition."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-[#002677] font-semibold bg-[#002677]/[0.04] p-3.5 rounded-xl border border-[#002677]/10">
          <Info className="w-4 h-4 text-[#002677] shrink-0" />
          <span>
            Calculated limit: Over 100 media uploads per batch execution
          </span>
        </div>
      </div>

      {/* Upload Widget */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center shadow-sm">
              <Files className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Bulk Verification Storage
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                PNG or PDF Direct Media Ingestion
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Select multiple graduating documents to upload. Processed
            credentials will be converted into dynamic hashes and committed to
            the block live ledger.
          </p>

          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-[#002677] bg-slate-50/50 rounded-xl p-6 sm:p-8 transition-all text-center group cursor-pointer">
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,image/png,image/jpeg"
              multiple
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-all text-slate-400 group-hover:text-[#002677]">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-800">
                Select multiple PDFs/PNG Images
              </p>
              <p className="text-[10px] text-slate-400">
                Drag or select PDF, PNG, JPG (Multiple files supported)
              </p>
            </div>
          </div>

          {/* File List */}
          {bulkFiles.length > 0 && (
            <div className="mt-6 border border-slate-150 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <div className="bg-slate-50 border-b border-slate-150 px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Queued Certificates ({bulkFiles.length})
                </span>
                <button
                  onClick={() => setBulkFiles([])}
                  disabled={isProcessing}
                  className="text-[10px] text-red-500 font-extrabold hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {bulkFiles.map((file, index) => (
                  <div
                    key={index}
                    className="px-4 py-2.5 flex items-center justify-between text-xs bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-4">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-all hover:bg-slate-100 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    Processing Bulk Certificates Ingestion...
                  </span>
                  <div className="w-4 h-4 border-2 border-[#002677] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[11px] font-mono text-slate-600 leading-snug">
                  → {processingStep}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          {isProcessing && progress.total > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress:</span>
                <span>
                  {progress.succeeded} succeeded, {progress.failed} failed
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-[#002677] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.processed / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {progress.processed} of {progress.total} processed
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={bulkFiles.length === 0 || isProcessing}
          className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
            bulkFiles.length > 0 && !isProcessing ?
              "bg-[#002677] text-white hover:bg-[#00174a] shadow-lg shadow-blue-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Hashing All ({bulkFiles.length} files)</span>
        </button>
      </div>
    </motion.div>
  );
};

export default BulkDocsTab;
