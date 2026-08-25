import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("\n🚀 Preparing to send email...");
    console.log("📤 To:", to);
    console.log("📨 Subject:", subject);
    console.log("👤 From:", process.env.EMAIL_USER);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("⏳ Verifying Gmail connection...");
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified!");

    const info = await transporter.sendMail({
      from: `"Healthcare Tracker 🏥" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || "Plain text fallback",
      html: html || "<p>Hello test mail</p>",
    });

    console.log("📧 Email sent successfully!");
    console.log("🔹 Message ID:", info.messageId);
    console.log("🔹 Response:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    console.error(err);
  }
};
