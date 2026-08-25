import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { sendEmail } from "../utils/email.js";

dotenv.config();

/**
 * 🩺 Register new doctor (with email verification)
 */
export const register = async (req, res) => {
  console.log("📩 Doctor Register API hit");
  try {
    const { name, email, password, phone, specialization, experience } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All required fields must be provided" });

    const existing = await Doctor.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      experience,
      isVerified: false,
    });

    await doctor.save();
    console.log("✅ New doctor saved:", doctor._id);

    // Generate verification token
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}&role=doctor`;
    console.log("🔗 Doctor verification link:", verifyLink);

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify Your Email - Healthcare Tracker (Doctor)",
      html: `
        <div style="font-family: 'Poppins', sans-serif; background-color: #f3f4f6; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="text-align: center;">
              <img src="https://cdn-icons-png.flaticon.com/512/2966/2966482.png" alt="Healthcare Logo" width="80" />
              <h1 style="color: #1d4ed8; margin-top: 16px;">Healthcare Tracker</h1>
            </div>
            <h2 style="color: #111827; margin-top: 24px;">Hello ${name},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 12px;">
              Thank you for registering as a healthcare provider! Please verify your email by clicking the button below.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyLink}" target="_blank"
                style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Verify My Email
              </a>
            </div>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #9ca3af; font-size: 13px; text-align: center;">
              If you didn’t register, you can safely ignore this email.<br />
              © ${new Date().getFullYear()} Healthcare Tracker. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      msg: "Doctor registered successfully! Please verify your email before logging in.",
    });
  } catch (error) {
    console.error("❌ Doctor registration error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
};

/**
 * 📧 Verify doctor email
 */
export const verifyEmail = async (req, res) => {
  console.log("📧 Doctor Verify Email API hit");
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id);
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    if (doctor.isVerified)
      return res.status(200).json({ msg: "Email already verified" });

    doctor.isVerified = true;
    await doctor.save();

    res.status(200).json({ msg: "Email verified successfully!" });
  } catch (error) {
    console.error("❌ Verify email error:", error);
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};

/**
 * 🔐 Doctor login
 */
export const login = async (req, res) => {
  console.log("🔐 Doctor Login API hit");
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Optional: disable email verification check if you want to test quickly
    if (!doctor.isVerified)
      return res
        .status(403)
        .json({ msg: "Please verify your email before logging in." });

    // ✅ Create JWT
    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ IMPORTANT — return `_id`, not `id`
    res.status(200).json({
      msg: "Login successful",
      token,
      user: { _id: doctor._id, name: doctor.name, email: doctor.email },
    });
  } catch (error) {
    console.error("❌ Doctor login error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
};


/**
 * 👤 Get doctor profile
 */
export const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✏️ Edit doctor profile
 */
export const editAccount = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, specialization, email, phone, experience } = req.body;

    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });

    if (req.userId !== doctorId)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { name, specialization, email, phone, experience },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedDoctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    res.status(200).json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ❌ Delete doctor account
 */
export const deleteAccount = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (req.userId !== doctorId)
      return res.status(403).json({ success: false, message: "Not authorized" });

    await Doctor.findByIdAndDelete(doctorId);
    res.status(200).json({ success: true, message: "Doctor account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📅 Get all appointments for doctor
 */
export const viewAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required" });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name age gender phone email")
      .sort({ datetime: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      details: error.message,
    });
  }
};


/**
 * ⏰ View pending sessions
 */
export const viewSessions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const sessions = await Appointment.find({ doctor: doctorId, status: "pending" })
      .populate("patient", "name age gender phone")
      .sort({ datetime: 1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🧍‍♂️ View patient details
 */
export const viewPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId).select("-password");
    if (!patient)
      return res.status(404).json({ success: false, message: "Patient not found" });

    res.status(200).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 👨‍⚕️ Get all doctors list
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true })
      .select("_id name specialization email");

    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch doctors" });
  }
};

/**
 * 🧠 Return the logged-in doctor (based on JWT)
 */
export const getMe = async (req, res) => {
  try {
    console.log("🧠 getMe route hit");
    console.log("req.userId:", req.userId);

    if (!req.userId)
      return res.status(401).json({ message: "Unauthorized - No userId found" });

    const doctor = await Doctor.findById(req.userId).select("-password");
    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ doctor });
  } catch (err) {
    console.error("❌ getMe error:", err.stack);
    res.status(500).json({ message: "Server error", details: err.message });
  }
};

/* ============================================================
   🤖 AI SMART RECOMMENDATION (for patient)
   Route: GET /api/recommend?specialty=Cardiology&location=Delhi
============================================================ */
export const recommendDoctors = async (req, res) => {
  try {
    const { specialty, preferredDate } = req.body;
    if (!specialty)
      return res.status(400).json({ message: "Specialty is required" });

    // find doctors by specialization (case-insensitive)
    const doctors = await Doctor.find({
      specialization: { $regex: specialty, $options: "i" },
      isVerified: true,
    });

    if (doctors.length === 0)
      return res.status(404).json({ message: "No doctors found for this specialty." });

    // dummy logic for now – you can improve later
    const recommendations = doctors.map((d) => ({
      doctorName: d.name,
      specialty: d.specialization,
      suggestedSlot: {
        date: preferredDate || new Date().toISOString().slice(0, 10),
        timeSlot: "10:00 AM - 11:00 AM",
      },
    }));

    res.status(200).json({
      message: "AI Recommendations generated",
      recommendations,
    });
  } catch (error) {
    console.error("AI recommendation error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};
