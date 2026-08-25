// backend/controllers/appointmentsController.js
import Appointment from "../models/Appointment.js";

// GET all appointments (admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization email")
      .sort({ datetime: -1 });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Error fetching appointments", error });
  }
};
