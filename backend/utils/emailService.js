import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendResetPasswordEmail = async (email, resetLink, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "BlockVerify-AI: Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1>BlockVerify-AI</h1>
            <p>Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password. Click the link below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">Or copy and paste this link in your browser:</p>
            <p style="color: #667eea; word-break: break-all; font-size: 12px;">${resetLink}</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>© 2026 BlockVerify-AI. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export const sendUniversityApprovalEmail = async (email, credentialLink, institutionalId, primaryContact) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "BlockVerify-AI: University Registration Approved - Credential Package",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1>BlockVerify-AI</h1>
            <p>Registration Approved ✓</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Dear ${primaryContact},</p>
            <p>Congratulations! Your university has been verified and approved by BlockVerify-AI regulatory board.</p>
            
            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2e7d32;">Your Institutional Access ID</h3>
              <p style="font-size: 14px; word-break: break-all;"><strong>${institutionalId}</strong></p>
            </div>
            
            <p><strong>Next Step:</strong> Please click the link below to set up your secure on-chain account and receive your credential package:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${credentialLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Credential Package
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">Or copy and paste this link in your browser:</p>
            <p style="color: #667eea; word-break: break-all; font-size: 12px;">${credentialLink}</p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px;"><strong>⚠️ Important:</strong> This credential link will expire in 7 days. Please complete the setup within this timeframe.</p>
            </div>
            
            <p style="color: #999; font-size: 12px;">If you have any questions, please contact our support team.</p>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>© 2026 BlockVerify-AI. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export const sendUniversityRejectionEmail = async (email, rejectionReason, primaryContact) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "BlockVerify-AI: University Registration - Additional Information Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1>BlockVerify-AI</h1>
            <p>Application Status Update</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Dear ${primaryContact},</p>
            <p>Thank you for submitting your university registration application. Our regulatory board has reviewed your submission.</p>
            
            <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #c62828;">Additional Information Required</h3>
              <p style="margin: 0;">${rejectionReason}</p>
            </div>
            
            <p>Please update your application with the requested information and resubmit. Our team will review the updated submission within 24 hours.</p>
            
            <p style="color: #999; font-size: 12px;">If you have any questions, please contact our support team.</p>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>© 2026 BlockVerify-AI. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
