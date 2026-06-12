// backend/test-email.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log("=== EMAIL CONFIGURATION TEST ===");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "***SET***" : "MISSING",
);
console.log("EMAIL_PASSWORD length:", process.env.EMAIL_PASSWORD?.length || 0);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("❌ Email credentials missing in .env file!");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email connection failed:", error);
  } else {
    console.log("✅ Email connection successful!");

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email from BlockVerify-AI",
      text: "If you receive this, email is working correctly!",
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Test email failed:", err);
      } else {
        console.log("✅ Test email sent! Message ID:", info.messageId);
      }
    });
  }
});
