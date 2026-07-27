import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const transporter =
  hasEmailConfig ?
    nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  : null;

const sendMail = async ({ to, subject, html, devLink }) => {
  if (!transporter) {
    console.log("Email credentials are not configured. Development link:");
    if (devLink) console.log(devLink);
    return { success: true, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `"BlockVerify-AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const baseTemplate = ({ title, subtitle, body }) => `
  <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e5e7eb;">
    <div style="background: #002677; padding: 22px; text-align: center; color: white;">
      <h2 style="margin: 0;">BlockVerify-AI</h2>
      <p style="margin: 8px 0 0;">${subtitle}</p>
    </div>
    <div style="padding: 24px; color: #1f2937;">
      <h3 style="margin-top: 0; color: #002677;">${title}</h3>
      ${body}
    </div>
  </div>
`;

export const sendResetPasswordEmail = async (email, resetLink, userName) => {
  return sendMail({
    to: email,
    subject: "BlockVerify-AI: Password Reset Request",
    devLink: resetLink,
    html: baseTemplate({
      title: "Reset Your Password",
      subtitle: "Password Reset Request",
      body: `
        <p>Hello ${userName || "there"},</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #002677; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
      `,
    }),
  });
};

export const sendUniversityApprovalEmail = async (
  email,
  activationLink,
  institutionalId,
  primaryContact,
  universityName,
) => {
  return sendMail({
    to: email,
    subject: "BlockVerify-AI: University Registration Approved",
    devLink: activationLink,
    html: baseTemplate({
      title: "University Registration Approved",
      subtitle: "Credential Package",
      body: `
        <p>Dear ${primaryContact || "University Admin"},</p>
        <p>Your application for <strong>${universityName}</strong> has been approved.</p>
        <div style="background: #ecfdf5; padding: 16px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 8px;"><strong>Institutional Access ID</strong></p>
          <code style="font-size: 16px;">${institutionalId}</code>
        </div>
        <p>Use the secure activation link below to create your university admin password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="background: #002677; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block;">Activate University Account</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">This activation link expires in 7 days.</p>
      `,
    }),
  });
};

export const sendUniversityRejectionEmail = async (
  email,
  rejectionReason,
  primaryContact,
) => {
  return sendMail({
    to: email,
    subject: "BlockVerify-AI: University Registration Update",
    html: baseTemplate({
      title: "Application Update Required",
      subtitle: "University Registration Review",
      body: `
        <p>Dear ${primaryContact || "University Admin"},</p>
        <p>Your application needs additional information before approval.</p>
        <div style="background: #fef2f2; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
          ${rejectionReason}
        </div>
        <p>Please submit a corrected application from the enrollment page.</p>
      `,
    }),
  });
};


export const sendContactEmail = async ({ name, email, phone, message }) => {
  const adminEmail = process.env.EMAIL_USER || "mt4458649@gmail.com";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background: #002677; padding: 24px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 24px;">BlockVerify-AI</h2>
        <p style="margin: 8px 0 0; opacity: 0.9;">New Contact Form Submission</p>
      </div>
      <div style="padding: 30px 24px; background: #ffffff;">
        <h3 style="margin-top: 0; color: #002677; font-size: 18px;">Contact Details</h3>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #002677;">${email}</a></p>
          <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
        </div>
        
        <div style="margin: 16px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #1e293b;">Message:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #002677;">
            <p style="margin: 0; white-space: pre-wrap; color: #334155;">${message}</p>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          This email was sent from the BlockVerify-AI contact form.
        </p>
      </div>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject: `📧 New Contact Form Message from ${name}`,
    html,
    devLink: null,
  });
};