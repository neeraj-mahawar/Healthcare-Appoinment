import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import nodemailer from "nodemailer";
import fetch from "node-fetch"; // IMPORTANT for keep-alive

// Routes
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import medicineRoutes from "./routes/medicines.js";
import remindersRoute from "./routes/reminders.js";
import doctorAuthRoutes from "./routes/doctorauth.js";
import patientAuthRoutes from "./routes/patientAuth.js";
import videoRoutes from "./routes/video.js";
import reportSummaryRoutes from "./routes/reportsummary.js";
import paymentRoutes from "./routes/payment.js";
import voiceBooking from "./routes/voiceBooking.js";

import Medicine from "./models/Medicine.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* -----------------------------------------------------------
🚀 CORS (FINAL PERFECT CONFIG)
----------------------------------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://healthcareappointment.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

/* -----------------------------------------------------------
🚀 Body Parser
----------------------------------------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* -----------------------------------------------------------
🚀 All Routes
----------------------------------------------------------- */
app.use("/api/reportsummary", reportSummaryRoutes);
app.use("/api/doctor", doctorAuthRoutes);
app.use("/api/patient/auth", patientAuthRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/reminders", remindersRoute);
app.use("/api/video", videoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/voice", voiceBooking);

/* -----------------------------------------------------------
🚀 Nodemailer
----------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* -----------------------------------------------------------
🚀 Socket.io — FIXED CORS
----------------------------------------------------------- */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://healthcareappointment.vercel.app"
    ],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔥 Socket connected:", socket.id);

  socket.on("joinRoom", (id) => socket.join(id));
  socket.on("userJoined", ({ appointmentId, role }) => {
    socket.to(appointmentId).emit("notifyJoin", { role });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* -----------------------------------------------------------
🚀 Daily Medicine Reminder
----------------------------------------------------------- */
cron.schedule("0 8 * * *", async () => {
  console.log("📩 Running daily medicine reminders...");

  const today = new Date();

  try {
    const meds = await Medicine.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate("userId");

    for (const med of meds) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: med.userId.email,
        subject: `Medicine Reminder: ${med.name}`,
        text: `Hi ${med.userId.name}, remember to take ${med.name} (${med.dosage}).`,
      });
    }

    console.log("✅ Reminders sent");
  } catch (err) {
    console.error("❌ Reminder error:", err);
  }
});

/* -----------------------------------------------------------
🚀 MongoDB Connect
----------------------------------------------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch((err) => console.error("❌ MongoDB connection failed", err));

/* -----------------------------------------------------------
🚀 SIMPLE SPEED ROUTE
----------------------------------------------------------- */
app.get("/", (req, res) => res.send("Backend Running 🚀"));

/* -----------------------------------------------------------
🔥 KEEP SERVER AWAKE (Render fix)
----------------------------------------------------------- */
setInterval(() => {
  fetch("https://backend-357b.onrender.com/")
    .then(() => console.log("🔥 Render server alive"))
    .catch(() => {});
}, 1000 * 60 * 4); // every 4 minutes

app.get("/api/voice/ping", (req, res) => res.send("pong"));

/* -----------------------------------------------------------
🚀 Start Server
----------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
});
