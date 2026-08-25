import express from "express";
import Appointment from "../models/Appointment.js";
import pkg from "agora-access-token"; // ✅ FIXED CommonJS import
const { RtcTokenBuilder, RtcRole } = pkg;

const router = express.Router();

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

/**
 * GET /api/video/:appointmentId
 * Returns Agora token + channel info + unique UID for each user
 * Users can join up to 10 minutes before appointment time
 */
router.get("/:appointmentId", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate("doctor", "name")
      .populate("patient", "name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!appointment.videoChannel) {
      appointment.videoChannel = `appointment_${appointment._id}`;
      await appointment.save();
    }

    const now = new Date();
    const apptTime = new Date(appointment.datetime);
    const earlyJoinTime = new Date(apptTime.getTime() - 10 * 60 * 1000);

    if (now < earlyJoinTime) {
      return res.status(403).json({
        success: false,
        message: `You can only join 10 minutes before the appointment (${apptTime.toLocaleString()})`,
        startTime: apptTime.toISOString(),
        canJoin: false,
      });
    }

    const channelName = appointment.videoChannel;
    const uid = Math.floor(Math.random() * 1000000);
    const expirationTimeInSeconds = 60 * 60;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    res.json({
      success: true,
      channel: channelName,
      token,
      uid,
      canJoin: true,
      doctorName: appointment.doctor?.name || "Doctor",
      patientName: appointment.patient?.name || "Patient",
    });
  } catch (err) {
    console.error("❌ Error generating video token:", err);
    res.status(500).json({ success: false, message: "Failed to generate video token" });
  }
});

export default router;
