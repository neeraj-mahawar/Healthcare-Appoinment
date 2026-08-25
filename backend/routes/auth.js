import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js"; // MongoDB patient model
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register (Signup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;

    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newPatient = new Patient({ name, email, password: hashed, phone, age, gender });
    await newPatient.save();

    // Generate JWT
    const token = jwt.sign({ id: newPatient._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        _id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful!",
      token,
      user: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get logged-in patient
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findById(req.userId).select("-password");
    if (!patient) return res.status(404).json({ message: "User not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
