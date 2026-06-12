// frontend/src/components/ApplicationDetails.jsx
import React, { useState } from "react";
import { X, FileText, CheckCircle, XCircle } from "lucide-react";
import styles from "./ApplicationDetails.module.css";

export default function ApplicationDetails({
  application,
  onApprove,
  onReject,
  onClose,
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

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
        return styles.pending;
      case "verified":
        return styles.verified;
      case "rejected":
        return styles.rejected;
      default:
        return "";
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    // Extract filename from path
    const fileName = filePath.split("\\").pop().split("/").pop();
    return `http://localhost:5000/uploads/${fileName}`;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Application Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>University Information</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{application.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{application.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Domain:</span>
              <span className={styles.value}>{application.domain}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>
                {application.city}, {application.country}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Registration #:</span>
              <span className={styles.value}>
                {application.registrationNumber}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Contact Person</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>
                {application.primaryContactName}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>
                {application.primaryContactPhone}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Authorized Email:</span>
              <span className={styles.value}>
                {application.authorizedEmail}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Status</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Current Status:</span>
              <span
                className={`${styles.statusBadge} ${getStatusClass(application.status)}`}
              >
                {application.status}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Submitted:</span>
              <span className={styles.value}>
                {formatDate(application.createdAt)}
              </span>
            </div>
            {application.verifiedAt && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Verified:</span>
                <span className={styles.value}>
                  {formatDate(application.verifiedAt)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Uploaded Documents</h3>
            <div className={styles.filesSection}>
              <div className={styles.fileItem}>
                <FileText size={16} />
                <a
                  href={getFileUrl(application.accreditationFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Accreditation Document
                </a>
              </div>
              <div className={styles.fileItem}>
                <FileText size={16} />
                <a
                  href={getFileUrl(application.registrationFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Registration Document
                </a>
              </div>
              <div className={styles.fileItem}>
                <FileText size={16} />
                <a
                  href={getFileUrl(application.authorityFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Authority Document
                </a>
              </div>
            </div>
          </div>

          {application.status === "pending" && (
            <div className={styles.actions}>
              <button
                className={styles.approveBtn}
                onClick={() => setShowApproveForm(true)}
              >
                <CheckCircle
                  size={16}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                Approve
              </button>
              <button
                className={styles.rejectBtn}
                onClick={() => setShowRejectForm(true)}
              >
                <XCircle
                  size={16}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                Reject
              </button>
            </div>
          )}

          {showApproveForm && (
            <div className={styles.section}>
              <h3>Approval Notes (Optional)</h3>
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="Add any notes for the university..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className={styles.actions} style={{ marginTop: "1rem" }}>
                <button
                  className={styles.approveBtn}
                  onClick={() => {
                    onApprove(application._id, adminNotes);
                    setShowApproveForm(false);
                  }}
                >
                  Confirm Approval
                </button>
                <button
                  className={styles.rejectBtn}
                  onClick={() => setShowApproveForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showRejectForm && (
            <div className={styles.section}>
              <h3>Rejection Reason *</h3>
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
              <div className={styles.actions} style={{ marginTop: "1rem" }}>
                <button
                  className={styles.rejectBtn}
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      onReject(application._id, rejectionReason);
                      setShowRejectForm(false);
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </button>
                <button
                  className={styles.approveBtn}
                  onClick={() => setShowRejectForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
