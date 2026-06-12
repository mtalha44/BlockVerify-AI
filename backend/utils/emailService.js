// backend/utils/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("🔧 Initializing email service...");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "✗ Missing");
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "✓ Set" : "✗ Missing",
);

// Create transporter with more compatible settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email verification failed:", error.message);
    console.error("   Make sure:");
    console.error("   1. App password is correct (16 characters, no spaces)");
    console.error("   2. 2-Step Verification is ON in Google Account");
    console.error("   3. App password is for 'Mail' app");
  } else {
    console.log("✅ Email service ready!");
  }
});

export const sendResetPasswordEmail = async (email, resetLink, userName) => {
  try {
    console.log(`📧 Sending reset email to: ${email}`);

    const mailOptions = {
      from: `"BlockVerify-AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "BlockVerify-AI: Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002677; padding: 20px; text-align: center; color: white;">
            <h2>BlockVerify-AI</h2>
            <p>Password Reset Request</p>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${userName},</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #002677; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>This link expires in 1 hour.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent!");
    return { success: true };
  } catch (error) {
    console.error("❌ Reset email error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendUniversityApprovalEmail = async (
  email,
  activationLink,
  institutionalId,
  primaryContact,
  universityName,
) => {
  try {
    console.log(`📧 Sending approval email to: ${email}`);

    const mailOptions = {
      from: `"BlockVerify-AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "BlockVerify-AI: University Registration Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002677; padding: 20px; text-align: center; color: white;">
            <h2>BlockVerify-AI</h2>
            <p>Registration Approved ✓</p>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${primaryContact},</p>
            <p>Congratulations! <strong>${universityName}</strong> has been approved.</p>
            <div style="background: #e8f5e9; padding: 15px; margin: 20px 0; border-left: 4px solid green;">
              <strong>Your Institutional Access ID:</strong><br>
              <code style="font-size: 16px;">${institutionalId}</code>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" style="background: #002677; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Activate Account</a>
            </div>
            <p style="font-size: 12px; color: #666;">Keep this ID safe. You'll need it to activate your account.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Approval email sent!");
    return { success: true };
  } catch (error) {
    console.error("❌ Approval email error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendUniversityRejectionEmail = async (
  email,
  rejectionReason,
  primaryContact,
) => {
  try {
    const mailOptions = {
      from: `"BlockVerify-AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "BlockVerify-AI: University Registration - Update Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #002677; padding: 20px; text-align: center; color: white;">
            <h2>BlockVerify-AI</h2>
            <p>Application Update Required</p>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${primaryContact},</p>
            <p>Your application needs additional information:</p>
            <div style="background: #ffebee; padding: 15px; margin: 20px 0; border-left: 4px solid red;">
              ${rejectionReason}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/UniversityEnrollment" style="background: #002677; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Update Application</a>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Rejection email error:", error);
    return { success: false, error: error.message };
  }
};
