// backend/utils/testEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"Healthcare Tracker" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "✅ Test Email from Healthcare Tracker",
      text: "Hello! This is a test email from your Healthcare Tracker app. 🎉",
    });

    console.log("📧 Test email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ Test email failed:", err);
  }
};

sendTestEmail();
