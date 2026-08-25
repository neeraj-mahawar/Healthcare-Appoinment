import express from "express";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// ✅ Verify email route
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    const model = role === "doctor" ? Doctor : Patient;
    const user = await model.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(200).json({ message: "Email already verified" });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
