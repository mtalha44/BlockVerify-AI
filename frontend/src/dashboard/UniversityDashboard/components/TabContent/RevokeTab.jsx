
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, Ban, Search, X, ShieldAlert } from "lucide-react";
import API from "../../../../api/axios";

const RevokeTab = ({ onTransactionUpdate, onStatsUpdate, stats }) => {
  // ← Added stats prop
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [revocationReason, setRevocationReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const handleSearch = async (value) => {
    setSearchTerm(value);

    if (value.length >= 2) {
      try {
        const response = await API.get(
          `/certificates/search-students?query=${encodeURIComponent(value)}`,
        );
        if (response.data.success) {
          setSearchResults(response.data.students);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStudent = (student) => {
    if (student.isBatchCertificate) {
      if (
        !confirm(
          `⚠️ This certificate is part of a batch (Batch ID: ${student.batchId || "N/A"}).\n\n` +
            `Revoking will mark it as revoked in the database but will NOT invalidate the blockchain Merkle Root.\n\n` +
            `Continue?`,
        )
      ) {
        return;
      }
    }
    setSelectedStudent(student);
    setSearchTerm(`${student.studentName} (${student.registrationNumber})`);
    setSearchResults([]);
  };

  const handleRevoke = async () => {
    if (!selectedStudent || !revocationReason) {
      alert("Please select a student and provide a reason for revocation.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Preparing revocation request...");

    try {
      setProcessingStep("Sending to blockchain...");

      const response = await API.post(
        `/certificates/revoke/${selectedStudent.certificateHash}`,
        { reason: revocationReason },
      );

      if (response.data.success) {
        setProcessingStep("✅ Certificate revoked successfully!");

        // Update transaction
        onTransactionUpdate(selectedStudent.certificateHash, {
          status: "Revoked",
          revocationReason: revocationReason,
          type: "Revocation",
        });

        // ✅ FIX: Use stats from props
        onStatsUpdate({
          verifiedStudents: Math.max(0, stats.verifiedStudents - 1),
          totalTxs: stats.totalTxs + 1,
        });

        // Clear selections
        setSelectedStudent(null);
        setSearchTerm("");
        setRevocationReason("");
        setSearchResults([]);

        setTimeout(() => {
          setIsProcessing(false);
          setProcessingStep("");
        }, 2000);
      } else {
        setProcessingStep(
          "❌ Error: " + (response.data.message || "Revocation failed"),
        );
        setTimeout(() => setIsProcessing(false), 3000);
      }
    } catch (error) {
      console.error("Revocation error:", error);
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
      <div className="lg:col-span-5 bg-red-50/[0.04] border border-red-105 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Security Protocol 03
          </span>
          <h3 className="text-xl font-bold text-red-600 mt-3">
            Revocation Process Standard
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Update blockchain parameters to invalidate verified hashes. This
            action modifies on-chain registries, warning subsequent
            verifications in real-time.
          </p>

          <div className="space-y-4 mt-6">
            {[
              "Search & Select Student",
              "Assign Reason Code",
              "Set Revoked State (0xEE)",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-red-105 flex items-center justify-center text-xs font-bold text-red-600 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{step}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {i === 0 &&
                      "Search by Name or Registration Number to find the certificate."}
                    {i === 1 &&
                      "Document official reasons (e.g. metadata discrepancy)."}
                    {i === 2 &&
                      "Commit change code directly. Future validation triggers failure."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50/20 p-3.5 rounded-xl border border-red-500/10">
          <Info className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            Calculated security: Deployed onto immediate transaction pipelines
          </span>
        </div>
      </div>

      {/* Revoke Widget */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <Ban className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-red-600">
                Revocation Management Protocol
              </h4>
              <p className="text-xs text-slate-400 font-medium pb-2">
                Search, select, and revoke certificates
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Search for a student by Name or Registration Number. Select the
            certificate and provide a reason for revocation.
          </p>

          {/* Search Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Search Student by Name or Registration Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type name or registration number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none text-slate-700 focus:border-red-400 focus:ring-1 focus:ring-red-100 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSearchResults([]);
                      setSelectedStudent(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  Found {searchResults.length} student(s)
                </div>
                {searchResults.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {student.studentName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Reg: {student.registrationNumber} | Roll:{" "}
                        {student.rollNumber}
                      </p>
                      {student.isBatchCertificate && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Batch Certificate
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">
                        {student.degree}
                      </span>
                      {student.isBatchCertificate && (
                        <div className="text-[10px] text-slate-400">
                          Batch ID: {student.batchId?.substring(0, 10)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Student */}
            {selectedStudent && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {selectedStudent.studentName}
                  </p>
                  <p className="text-xs text-green-600">
                    Reg: {selectedStudent.registrationNumber} | Hash:{" "}
                    {selectedStudent.certificateHash?.substring(0, 16)}...
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setSearchTerm("");
                  }}
                  className="text-green-600 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Revocation Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Official Invalidation Reason
              </label>
              <input
                type="text"
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="Falsified documentation, data discrepancy etc..."
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none text-slate-700 focus:border-red-400 focus:ring-1 focus:ring-red-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-5 p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-xs font-bold text-red-800 animate-pulse">
                    Committing Off-chain Status Updates...
                  </span>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[11px] font-mono text-red-700 leading-snug">
                  → {processingStep}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleRevoke}
          disabled={!selectedStudent || !revocationReason || isProcessing}
          className={`w-full mt-8 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
            selectedStudent && revocationReason && !isProcessing ?
              "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/15 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>Revoke Certificate Now</span>
        </button>
      </div>
    </motion.div>
  );
};

export default RevokeTab;
