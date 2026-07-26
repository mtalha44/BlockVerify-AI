import React from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  Clock,
  Hash,
  ExternalLink,
  X,
} from "lucide-react";

const VerificationResultModal = ({ isOpen, onClose, result, certificate }) => {
  if (!isOpen || !result) return null;

  const isVerified = result.success && result.isValid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isVerified ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              {isVerified ?
                <CheckCircle2 className="size-6 text-emerald-600" />
              : <XCircle className="size-6 text-red-600" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isVerified ? "Certificate Verified!" : "Verification Failed"}
              </h3>
              <p className="text-sm text-slate-500">
                {isVerified ?
                  "This certificate is authentic and verified on blockchain"
                : result.message || "Certificate could not be verified"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {certificate && (
            <div className="space-y-4">
              {/* Certificate Details */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="size-4" />
                  Certificate Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      Student Name
                    </p>
                    <p className="font-medium text-slate-900">
                      {certificate.studentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      Registration
                    </p>
                    <p className="font-medium text-slate-900">
                      {certificate.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      Degree
                    </p>
                    <p className="font-medium text-slate-900">
                      {certificate.degree}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      University
                    </p>
                    <p className="font-medium text-slate-900">
                      Punjab University of Technology, Lahore
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      Session
                    </p>
                    <p className="font-medium text-slate-900">
                      {certificate.session || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      CGPA
                    </p>
                    <p className="font-medium text-slate-900">
                      {certificate.cgpa || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  Blockchain Verification
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`font-semibold ${
                        isVerified ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isVerified ? "Verified ✓" : "Not Verified ✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Transaction Hash</span>
                    <span className="font-mono text-xs text-slate-700 truncate max-w-[200px]">
                      {certificate.transactionHash?.slice(0, 16)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Block Number</span>
                    <span className="font-mono text-xs text-slate-700">
                      {certificate.blockNumber || "N/A"}
                    </span>
                  </div>
                  {certificate.merkleRoot && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Merkle Root</span>
                      <span className="font-mono text-xs text-slate-700 truncate max-w-[200px]">
                        {certificate.merkleRoot.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                  {certificate.isBatchCertificate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Batch Certificate</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Yes
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationResultModal;
