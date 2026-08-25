import express from "express";
import {
  register,
  login,
  verifyEmail,
  getProfile,
  editAccount,
  deleteAccount,
  viewAppointments,
  viewSessions,
  viewPatientDetails,
  getAllDoctors,
  getMe,
  recommendDoctors,
} from "../controllers/doctorController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧾 Public routes
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);

// 🧠 Logged-in doctor info (must come BEFORE /:id)
router.get("/me", authMiddleware, getMe);

// 🩺 Protected doctor data routes
router.get("/auth", getAllDoctors);
router.get("/appointments/:doctorId", authMiddleware, viewAppointments);
router.get("/sessions/:doctorId", authMiddleware, viewSessions);
router.get("/patients/:patientId", authMiddleware, viewPatientDetails);
router.put("/account/:doctorId", authMiddleware, editAccount);
router.delete("/account/:doctorId", authMiddleware, deleteAccount);

// ⚠️ Place LAST to avoid catching /me
router.get("/:id", authMiddleware, getProfile);
router.post("/recommend", recommendDoctors);

export default router;
