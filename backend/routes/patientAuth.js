import express from "express";
import {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  deleteAccount,
  getAppointments,
  getMe, // ✅ this will return the logged-in patient
} from "../controllers/patientController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // ✅ correct filename

const router = express.Router();

// 🧾 Authentication routes
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);

// 🧠 Logged-in patient info (must be before /:id route!)
router.get("/me", authMiddleware, getMe); // ✅ moved above /:id

// 👤 Patient profile management
router.get("/:id", getProfile);
router.put("/:id", updateProfile);
router.delete("/:id", deleteAccount);

// 📅 Appointments
router.get("/:id/appointments", getAppointments);

export default router;
