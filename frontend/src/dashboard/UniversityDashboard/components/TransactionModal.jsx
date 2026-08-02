// frontend/src/dashboard/UniversityDashboard/components/TransactionModal.jsx
import { motion } from "motion/react";
import { Activity, X, ShieldAlert } from "lucide-react";

const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isVerified = transaction.status === "Verified";
  const isRevoked = transaction.status === "Revoked";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Modal Banner */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm tracking-wider uppercase font-mono">
              Block Ledger Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 text-center">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                isVerified ? "bg-green-100 text-green-700"
                : isRevoked ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isVerified ?
                "Verified Immutable Root"
              : isRevoked ?
                "Status: Revoked Reference"
              : "Status: Pending"}
            </span>
            <h3 className="text-xl font-extrabold text-[#002677] mt-2">
              {transaction.student}
            </h3>
            <p className="text-xs text-slate-500">
              Student Roll No: {transaction.rollNumber}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {/* Hash */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Immutable Content Block Hash
              </div>
              <div className="text-xs font-mono text-[#002677] select-all break-all font-semibold mt-1">
                {transaction.hash}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Degree Field
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                  {transaction.degree || "N/A"}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Cumulative GPA
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  {transaction.gpa || "N/A"} / 4.00
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Block Height
                </div>
                <div className="text-xs font-mono font-semibold text-slate-700 mt-1">
                  #{transaction.blockNumber || "Pending"}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Gas Limit Used
                </div>
                <div className="text-xs font-semibold text-emerald-600 mt-1">
                  {transaction.gasUsed || "~45,000 Gas"}
                </div>
              </div>
            </div>

            {/* Merkle Proof */}
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] leading-relaxed">
              <p className="text-blue-400 font-bold mb-1">
                // Standard Merkle Tree Proof Path:
              </p>
              <p>
                Leaf Link Code [0]: sha256("{transaction.student}:
                {transaction.rollNumber}")
              </p>
              <p>Sibling hash [L1]: "0x6f2a...88bc"</p>
              <p>Intermediate Parent Node [L2]: "0xfa11...7a29"</p>
              <p className="text-green-400">
                State Root Hash verified on block:{" "}
                {isVerified ? "TRUE ✓" : "FALSE ✗"}
              </p>
            </div>

            {/* Revocation Warning */}
            {isRevoked && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-red-800">
                    Reason for Revocation
                  </div>
                  <p className="text-xs text-red-750 mt-0.5 leading-relaxed">
                    {transaction.revocationReason ||
                      "Administrative invalidation."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <button
            onClick={onClose}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
          >
            Close Ledger Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionModal;
