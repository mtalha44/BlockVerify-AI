import { sendContactEmail } from "../../utils/emailService.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Send email to admin
    const result = await sendContactEmail({
      name,
      email,
      phone: phone || "Not provided",
      message,
    });

    if (!result.success) {
      console.error("Email sending failed:", result.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send message. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong. Please try again.",
    });
  }
};
