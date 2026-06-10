import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { passwordAPI } from "../services/passwordAPI";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await passwordAPI.forgotPassword(email);
      setMessage(result.message || "If this email exists, a reset link has been sent");
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Reset Your Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          {message && <div className={styles.success}>{message}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Remember your password?{" "}
            <a href="/login" className={styles.link}>
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
