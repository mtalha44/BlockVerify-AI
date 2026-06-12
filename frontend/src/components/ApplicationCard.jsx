// frontend/src/components/ApplicationCard.jsx
import React from "react";
import styles from "./ApplicationCard.module.css";

export default function ApplicationCard({ application, onSelect }) {
  const getStatusColor = (status) => {
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.card} onClick={onSelect}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>{application.name}</h3>
          <p className={styles.domain}>
            {application.domain || application.email?.split("@")[1]}
          </p>
        </div>
        <span
          className={`${styles.status} ${getStatusColor(application.status)}`}
        >
          {application.status}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>
            {application.authorizedEmail || application.email}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Location:</span>
          <span className={styles.value}>
            {application.city}, {application.country}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Contact:</span>
          <span className={styles.value}>{application.primaryContactName}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Submitted:</span>
          <span className={styles.value}>
            {formatDate(application.createdAt)}
          </span>
        </div>
      </div>

      <button className={styles.viewBtn}>View Details & Review</button>
    </div>
  );
}
