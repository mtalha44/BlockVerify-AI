import React, { useState } from "react";
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
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>{application.name}</h3>
          <p className={styles.domain}>{application.domain}</p>
        </div>
        <span className={`${styles.status} ${getStatusColor(application.status)}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{application.email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Location:</span>
          <span className={styles.value}>
            {application.city}, {application.country}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Contact:</span>
          <span className={styles.value}>
            {application.primaryContactName} ({application.primaryContactPhone})
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Submitted:</span>
          <span className={styles.value}>{formatDate(application.createdAt)}</span>
        </div>
      </div>

      <button className={styles.viewBtn} onClick={onSelect}>
        View Details & Review
      </button>
    </div>
  );
}
