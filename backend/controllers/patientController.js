// backend/controllers/patientController.js
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { sendEmail } from "../utils/email.js";

dotenv.config();

// 📝 Register new patient (with email verification)
export const register = async (req, res) => {
  console.log("📩 Register route hit, body:", req.body);
  try {
    const { name, email, password, phone, age, gender } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const existing = await Patient.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = new Patient({
      name,
      email,
      password: hashedPassword,
      phone,
      age,
      gender,
      isVerified: false,
    });

    await patient.save();
    console.log("✅ New patient saved:", patient._id);

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("FRONTEND_URL from env:", process.env.FRONTEND_URL);

   const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}&role=patient`;

    console.log("🔗 Verification link:", verifyLink);

await sendEmail({
  to: email,
  subject: "Verify Your Email - Healthcare Tracker (Patient)",
  html: `
    <div style="font-family: 'Poppins', sans-serif; background-color: #f3f4f6; padding: 40px 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/2966/2966482.png" alt="Healthcare Logo" width="80" />
          <h1 style="color: #1d4ed8; margin-top: 16px;">Healthcare Tracker</h1>
        </div>

        <h2 style="color: #111827; margin-top: 24px;">Hello ${name},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 12px;">
          Thank you for signing up! Please confirm your email address by clicking the button below.
          This helps us keep your account secure.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyLink}" target="_blank"
            style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">
            Verify My Email
          </a>
        </div>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="color: #9ca3af; font-size: 13px; text-align: center;">
          If you didn’t create this account, you can safely ignore this email.<br />
          © ${new Date().getFullYear()} Healthcare Tracker. All rights reserved.
        </p>
      </div>
    </div>
  `,
});

    console.log("📨 Verification email sent successfully!");

    res.status(201).json({
      msg: "Registration successful! Please verify your email before logging in.",
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Verify Email API
export const verifyEmail = async (req, res) => {
  console.log("📧 Verify email route hit!");
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const patient = await Patient.findById(decoded.id);
    if (!patient) return res.status(404).json({ msg: "User not found" });

    if (patient.isVerified)
      return res.status(200).json({ msg: "Email already verified" });

    patient.isVerified = true;
    await patient.save();

    res.status(200).json({ msg: "Email verified successfully!" });
  } catch (err) {
    console.error("❌ Verify email error:", err);
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};
export const login = async (req, res) => {
  console.log("🔐 Login API hit!");
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!patient.isVerified)
      return res.status(403).json({ msg: "Please verify your email before logging in." });

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({
      msg: "Login successful",
      token,
      user: { id: patient._id, name: patient.name, email: patient.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ msg: "Server error", details: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("appointments");
    if (!patient) return res.status(404).json({ msg: "Patient not found" });
    return res.json(patient);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "Invalid patient ID" });

    const { name, phone, age, gender } = req.body;
    const updated = await Patient.findByIdAndUpdate(
      id,
      { name, phone, age, gender },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ msg: "Patient not found" });
    return res.json(updated);
  } catch (err) {
    console.error("❌ Update profile error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    return res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const appointments = await Appointment.find({ patient: id })
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization email")
      .sort({ datetime: -1 });

    if (!appointments.length)
      return res.status(404).json({ success: false, message: "No appointments found for this patient" });

    return res.status(200).json({ success: true, appointments });
  } catch (err) {
    console.error("❌ Appointments fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching appointments" });
  }
};

// ✅ Get logged-in patient details
export const getMe = async (req, res) => {
  try {
    const patient = await Patient.findById(req.userId);
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.status(200).json({ patient });
  } catch (err) {
    console.error("❌ getMe error:", err);
    res.status(500).json({ message: "Server error", details: err.message });
  }
};
