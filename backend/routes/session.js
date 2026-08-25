import express from "express";
import mongoose from "mongoose";
import Session from "../models/Session"; // Make sure you have this model

const router = express.Router();

// ✅ Get all sessions for a doctor
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });
    }

    const sessions = await Session.find({ doctorId }).sort({ datetime: 1 });
    res.json({ success: true, sessions });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ success: false, message: "Failed to fetch sessions" });
  }
});

// ✅ Create a new session
router.post("/", async (req, res) => {
  try {
    const { doctorId, patientName, datetime, notes } = req.body;
    if (!doctorId || !patientName || !datetime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const session = await Session.create({
      doctorId,
      patientName,
      datetime,
      notes: notes || "",
    });

    res.json({ success: true, session });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ success: false, message: "Failed to create session" });
  }
});

export default router;
