import React, { useState } from "react";
import {
  X,
  FileText,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  MapPin,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Check,
  ExternalLink,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function ApplicationDetails({
  application,
  onApprove,
  onReject,
  onClose,
  isProcessing = false, // Add this prop to track processing state
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "verified":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "verified":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    const fileName = filePath.split("\\").pop().split("/").pop();
    return `http://localhost:5000/uploads/universities/${fileName}`;
  };

  const handleApproveConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(application._id, adminNotes);
      // Don't reset form here, let the parent handle it
    } catch (error) {
      console.error("Approval error:", error);
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(application._id, rejectionReason);
      // Don't reset form here, let the parent handle it
    } catch (error) {
      console.error("Rejection error:", error);
      setIsSubmitting(false);
    }
  };

  // Close handlers with proper cleanup
  const handleClose = () => {
    if (isSubmitting) return; // Don't close while submitting
    setShowApproveForm(false);
    setShowRejectForm(false);
    setAdminNotes("");
    setRejectionReason("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#002677] to-[#1a3a7a] rounded-xl shadow-lg shadow-[#002677]/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#002677]">
                Application Details
              </h2>
              <p className="text-sm text-slate-500">
                Review university registration
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Status:
              </span>
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(application.status)}`}
              >
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status}</span>
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Submitted: {formatDate(application.createdAt)}
            </span>
          </div>

          {/* University Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#002677]" />
              University Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200/60">
              <div>
                <p className="text-xs text-slate-500">University Name</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Domain</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.domain}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.city}, {application.country}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Registration Number</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.registrationNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#002677]" />
              Contact Person
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200/60">
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.primaryContactName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.primaryContactPhone}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Authorized Email</p>
                <p className="text-sm font-medium text-slate-900">
                  {application.authorizedEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#002677]" />
              Uploaded Documents
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
              {[
                {
                  label: "Accreditation Document",
                  path: application.accreditationFile,
                },
                {
                  label: "Registration Document",
                  path: application.registrationFile,
                },
                {
                  label: "Authority Document",
                  path: application.authorityFile,
                },
              ].map((doc, index) => (
                <a
                  key={index}
                  href={getFileUrl(doc.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-[#002677]/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#002677]/5 rounded-lg">
                      <FileText className="w-4 h-4 text-[#002677]" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {doc.label}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#002677] transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Actions */}
          {application.status === "pending" && !isSubmitting && (
            <div className="border-t border-slate-200/80 pt-6">
              {!showApproveForm && !showRejectForm && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20"
                    onClick={() => {
                      setShowApproveForm(true);
                      setShowRejectForm(false);
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Application
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/20"
                    onClick={() => {
                      setShowRejectForm(true);
                      setShowApproveForm(false);
                    }}
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Application
                  </button>
                </div>
              )}

              {showApproveForm && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Approval Notes (Optional)
                  </h4>
                  <textarea
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                    rows="3"
                    placeholder="Add any notes for the university (optional)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleApproveConfirm}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ?
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      : <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm Approval
                        </>
                      }
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setShowApproveForm(false);
                        setAdminNotes("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showRejectForm && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Rejection Reason *
                  </h4>
                  <textarea
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                    rows="3"
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleRejectConfirm}
                      disabled={isSubmitting || !rejectionReason.trim()}
                    >
                      {isSubmitting ?
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      : <>
                          <XCircle className="w-4 h-4" />
                          Confirm Rejection
                        </>
                      }
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing State (when approving/rejecting) */}
          {isSubmitting && (
            <div className="border-t border-slate-200/80 pt-6">
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="w-5 h-5 border-2 border-[#002677] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-slate-600">
                  Processing your request...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
