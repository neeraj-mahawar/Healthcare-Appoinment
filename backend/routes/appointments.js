import express from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { sendEmail } from "../utils/email.js";
import ics from "ics";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

dotenv.config();
const router = express.Router();

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------------------------------------------------
   🗓️ Route 1: Generate & serve .ics calendar event
--------------------------------------------------- */
router.get("/:id/calendar", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor")
      .populate("patient");

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const start = new Date(appointment.datetime);
    const end = new Date(start.getTime() + 30 * 60000); // 30 minutes later

    // ✅ Clean formatted details
    const feeText =
      appointment.fee && appointment.fee > 0
        ? `💰 Consultation Fee: ₹${appointment.fee}`
        : "💰 Consultation Fee: N/A";

    const desc = `
📅 Appointment Details

👨‍⚕️ Doctor: Dr. ${appointment.doctor.name}
💼 Specialty: ${appointment.doctor.specialization || "General Practitioner"}
🧑‍💼 Patient: ${appointment.patient.name}
${feeText}

💊 Medicines: ${appointment.medicine || "Not specified"}

🔗 Video Consultation Link:
https://healthcareappointment.vercel.app/video/${appointment._id}

💚 Brought to you by HealthPrime — Virtual Healthcare Platform
    `.trim();

    const event = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
      ],
      title: `🩺 Consultation with Dr. ${appointment.doctor.name}`,
      description: desc,
      location: "HealthPrime Virtual Platform",
      url: `https://healthcareappointment.vercel.app/video/${appointment._id}`,
      status: "CONFIRMED",
      organizer: {
        name: "HealthPrime",
        email: process.env.EMAIL_USER || "support@healthprime.com",
      },
      attendees: [
        {
          name: appointment.patient.name,
          email: appointment.patient.email,
          rsvp: true,
          partstat: "ACCEPTED",
          role: "REQ-PARTICIPANT",
        },
      ],
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        console.error("ICS Error:", error);
        return res.status(500).json({ message: "ICS generation failed" });
      }

      res.setHeader("Content-Type", "text/calendar");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=HealthPrime-appointment-${appointment._id}.ics`
      );
      res.send(value);
    });
  } catch (err) {
    console.error("ICS Error:", err);
    res.status(500).json({ message: "Failed to generate calendar file" });
  }
});

/* ---------------------------------------------------
   🧾 Route: Generate & serve Stylish PDF Receipt
--------------------------------------------------- */
router.get("/:id/receipt", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor")
      .populate("patient");

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // 🧠 HTML Template (You can customize styles here)
    const htmlContent = `
      <div style="margin:0;padding:0;background:#f5fdf7;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding:30px 10px;">
              <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" 
                style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;
                box-shadow:0 6px 30px rgba(0,0,0,0.08);border:1px solid #eaf2ef;">
                
                <!-- HEADER -->
                <tr>
                  <td bgcolor="#16a34a" 
                    style="background:linear-gradient(135deg,#16a34a,#0ea5e9);padding:50px 40px;color:#ffffff;">
                    <table width="100%">
                      <tr>
                        <td width="70">
                          <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" width="60" height="60" alt="Done" style="border-radius:14px;">
                        </td>
                        <td style="padding-left:20px;">
                          <h1 style="margin:0;font-size:26px;font-weight:700;">Appointment Completed</h1>
                          <p style="margin:8px 0 0;font-size:15px;opacity:0.9;">Your session was successfully completed</p>
                        </td>
                        <td align="right">
                          <span style="background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:9999px;
                            font-size:13px;font-weight:600;">✅ Completed</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:50px 40px 40px;color:#1a1a1a;">
                    <p style="font-size:16px;margin:0 0 8px;">Dear <strong>${appointment.patient.name}</strong>,</p>
                    <p style="font-size:15px;color:#555;margin-bottom:30px;line-height:1.6;">
                      Thank you for attending your consultation with 
                      <strong>${appointment.doctor.name}</strong>.<br/>
                      We hope you found your session valuable.
                    </p>

                    <!-- Doctor Card -->
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" 
                      style="background:#f0fdf4;border:1px solid #d1f7d6;border-radius:16px;margin-bottom:30px;">
                      <tr>
                        <td style="padding:18px;">
                          <table cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="70" valign="top">
                                <img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" 
                                  alt="Doctor" width="70" height="70" style="border-radius:12px;display:block;">
                              </td>
                              <td style="padding-left:15px;vertical-align:top;">
                                <div style="font-size:16px;font-weight:600;"> ${appointment.doctor.name}</div>
                                <div style="font-size:13px;color:#555;">
                                  ${appointment.doctor.specialization || "Consultant"}
                                </div>
                                <div style="margin-top:6px;font-size:12px;background:#e9fdf6;color:#008a73;
                                  border-radius:9999px;display:inline-block;padding:4px 10px;">
                                  🩺 Teleconsultation
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Appointment Details -->
                    <table style="width:100%;font-size:14px;color:#333;margin-bottom:25px;">
                      <tr><td><strong>Date & Time:</strong></td><td>${new Date(appointment.datetime).toLocaleString()}</td></tr>
                      <tr><td><strong>Consultation Fee:</strong></td><td>₹ 500</td></tr>
                      <tr><td><strong>Medicines:</strong></td><td>${appointment.medicine || "None"}</td></tr>
                    </table>

                    <!-- Tip Box -->
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" 
                      style="background:#ecfdf7;border-radius:14px;margin-top:20px;">
                      <tr>
                        <td style="padding:16px 20px;font-size:13px;color:#007e66;line-height:1.6;">
                          💡 <strong>Tip:</strong> Keep your digital prescription safe and follow 
                          any post-consultation care suggested by your doctor.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td bgcolor="#f9fafb" style="padding:24px 20px;border-top:1px solid #edf1f2;
                    text-align:center;font-size:13px;color:#666;">
                    © ${new Date().getFullYear()} <strong>Healthcare Tracker</strong> • 
                    <a href="#" style="color:#0078d7;text-decoration:none;">Privacy</a> • 
                    <a href="#" style="color:#0078d7;text-decoration:none;">Support</a>
                  </td>
                </tr>
              </table>
              <p style="font-size:12px;color:#8f8f8f;text-align:center;margin-top:10px;">
                Delivered securely by Healthcare Tracker 💚
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;

    // 🧩 Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm" },
    });

    await browser.close();

    // 🧾 Send PDF to client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=appointment-${appointment._id}.pdf`);

    res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
});



// ✅ Complete appointment
router.put("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization email");

    if (!appt)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    const patient = appt.patient;
    const doctor = appt.doctor;

   const completedEmailHTML = `
    <div style="margin:0;padding:0;background:#f5fdf7;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center" style="padding:30px 10px;">
            <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.08);border:1px solid #eaf2ef;">

              <!-- HEADER -->
              <tr>
                <td bgcolor="#16a34a" style="background:linear-gradient(135deg,#16a34a,#0ea5e9);padding:50px 40px;color:#ffffff;">
                  <table width="100%">
                    <tr>
                      <td width="70">
                        <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" width="60" height="60" alt="Done" style="border-radius:14px;">
                      </td>
                      <td style="padding-left:20px;">
                        <h1 style="margin:0;font-size:26px;font-weight:700;">Appointment Completed</h1>
                        <p style="margin:8px 0 0;font-size:15px;opacity:0.9;">Your session was successfully completed 🎯</p>
                      </td>
                      <td align="right">
                        <span style="background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:9999px;font-size:13px;font-weight:600;">✅ Completed</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:50px 40px 40px;color:#1a1a1a;">
                  <p style="font-size:16px;margin:0 0 8px;">Dear <strong>${patient.name}</strong>,</p>
                  <p style="font-size:15px;color:#555;margin-bottom:30px;line-height:1.6;">
                    Thank you for attending your consultation with <strong>${doctor.name}</strong>.<br/>
                    We hope you found your session valuable. Please keep your follow-up notes and medication list safe.
                  </p>

                  <!-- Doctor Card -->
                  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdf4;border:1px solid #d1f7d6;border-radius:16px;margin-bottom:30px;">
                    <tr>
                      <td style="padding:18px;">
                        <table cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td width="70" valign="top">
                              <img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="Doctor" width="70" height="70" style="border-radius:12px;display:block;">
                            </td>
                            <td style="padding-left:15px;vertical-align:top;">
                              <div style="font-size:16px;font-weight:600;"> ${doctor.name}</div>
                              <div style="font-size:13px;color:#555;">${doctor.specialization || "Consultant"}</div>
                              <div style="margin-top:6px;font-size:12px;background:#e9fdf6;color:#008a73;border-radius:9999px;display:inline-block;padding:4px 10px;">🩺 Teleconsultation</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Feedback Button -->
                  <table align="center" cellspacing="0" cellpadding="0" border="0" style="margin:30px auto;">
                    <tr>
                      <td align="center" bgcolor="#16a34a" style="border-radius:50px;">
                        <a href="https://healthcareappointment.vercel.app/feedback/${appt._id}" target="_blank"
                          style="font-size:16px;font-weight:600;text-decoration:none;color:#ffffff;background:linear-gradient(90deg,#16a34a,#0ea5e9);padding:14px 38px;border-radius:50px;display:inline-block;">
                          🌟 Give Feedback
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Tip Box -->
                  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ecfdf7;border-radius:14px;margin-top:20px;">
                    <tr>
                      <td style="padding:16px 20px;font-size:13px;color:#007e66;line-height:1.6;">
                        💡 <strong>Tip:</strong> Keep your digital prescription safe and follow any post-consultation care suggested by your doctor.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td bgcolor="#f9fafb" style="padding:24px 20px;border-top:1px solid #edf1f2;text-align:center;font-size:13px;color:#666;">
                  © ${new Date().getFullYear()} <strong>Healthcare Tracker</strong> • 
                  <a href="#" style="color:#0078d7;text-decoration:none;">Privacy</a> • 
                  <a href="#" style="color:#0078d7;text-decoration:none;">Support</a>
                </td>
              </tr>
            </table>
            <p style="font-size:12px;color:#8f8f8f;text-align:center;margin-top:10px;">Delivered securely by Healthcare Tracker 💚</p>
          </td>
        </tr>
      </table>
    </div>
    `;

    if (patient?.email) {
      await sendEmail({
        to: patient.email,
        subject: "✅ Appointment Completed - Healthcare Tracker",
        html: completedEmailHTML,
      });
    }

    res.json({
      success: true,
      message: "Appointment marked as completed & email sent.",
      appointment: appt,
    });
  } catch (err) {
    console.error("❌ Error completing appointment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// ❌ Cancel appointment
router.put("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization email");

    if (!appt)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    const patient = appt.patient;
    const doctor = appt.doctor;

    const cancelledEmailHTML = `
    <div style="margin:0;padding:0;background:#fef2f2;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center" style="padding:30px 10px;">
            <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.08);border:1px solid #fde2e2;">

              <!-- HEADER -->
              <tr>
                <td bgcolor="#dc2626" style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:50px 40px;color:#ffffff;">
                  <table width="100%">
                    <tr>
                      <td width="70">
                        <img src="https://cdn-icons-png.flaticon.com/512/463/463612.png" width="60" height="60" alt="Cancelled" style="border-radius:14px;">
                      </td>
                      <td style="padding-left:20px;">
                        <h1 style="margin:0;font-size:26px;font-weight:700;">Appointment Cancelled</h1>
                        <p style="margin:8px 0 0;font-size:15px;opacity:0.9;">Your scheduled session has been cancelled ❌</p>
                      </td>
                      <td align="right">
                        <span style="background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:9999px;font-size:13px;font-weight:600;">❌ Cancelled</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:50px 40px 40px;color:#1a1a1a;">
                  <p style="font-size:16px;margin:0 0 8px;">Dear <strong>${patient.name}</strong>,</p>
                  <p style="font-size:15px;color:#555;margin-bottom:30px;line-height:1.6;">
                    We’re sorry to inform you that your appointment with <strong>${doctor.name}</strong> on <b>${appt.date}</b> has been <b>cancelled</b>.
                  </p>

                  <!-- Doctor Card -->
                  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fef2f2;border:1px solid #fca5a5;border-radius:16px;margin-bottom:30px;">
                    <tr>
                      <td style="padding:18px;">
                        <table cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td width="70" valign="top">
                              <img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="Doctor" width="70" height="70" style="border-radius:12px;display:block;">
                            </td>
                            <td style="padding-left:15px;vertical-align:top;">
                              <div style="font-size:16px;font-weight:600;">${doctor.name}</div>
                              <div style="font-size:13px;color:#555;">${doctor.specialization || "Consultant"}</div>
                              <div style="margin-top:6px;font-size:12px;background:#fee2e2;color:#991b1b;border-radius:9999px;display:inline-block;padding:4px 10px;">⏳ Cancelled</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Rebook Button -->
                  <table align="center" cellspacing="0" cellpadding="0" border="0" style="margin:30px auto;">
                    <tr>
                      <td align="center" bgcolor="#dc2626" style="border-radius:50px;">
                        <a href="https://healthcareappointment.vercel.app/book-appointment" target="_blank"
                          style="font-size:16px;font-weight:600;text-decoration:none;color:#ffffff;background:linear-gradient(90deg,#ef4444,#f87171);padding:14px 38px;border-radius:50px;display:inline-block;">
                          🔁 Rebook Appointment
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Support Tip -->
                  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff7ed;border-radius:14px;margin-top:20px;">
                    <tr>
                      <td style="padding:16px 20px;font-size:13px;color:#b45309;line-height:1.6;">
                        💬 <strong>Need help?</strong> Contact our support team if this cancellation was not intentional or you wish to reschedule your session.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td bgcolor="#f9fafb" style="padding:24px 20px;border-top:1px solid #f5e0df;text-align:center;font-size:13px;color:#666;">
                  © ${new Date().getFullYear()} <strong>Healthcare Tracker</strong> • 
                  <a href="#" style="color:#ef4444;text-decoration:none;">Support</a> • 
                  <a href="#" style="color:#ef4444;text-decoration:none;">Privacy</a>
                </td>
              </tr>
            </table>
            <p style="font-size:12px;color:#8f8f8f;text-align:center;margin-top:10px;">Delivered securely by Healthcare Tracker ❤️</p>
          </td>
        </tr>
      </table>
    </div>
    `;

    if (patient?.email) {
      await sendEmail({
        to: patient.email,
        subject: "❌ Appointment Cancelled - Healthcare Tracker",
        html: cancelledEmailHTML,
      });
    }

    res.json({
      success: true,
      message: "Appointment marked as cancelled & email sent.",
      appointment: appt,
    });
  } catch (err) {
    console.error("❌ Error cancelling appointment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ✅ Get all appointments (for Admin/Doctor/Patient)
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name specialization email")
      .populate("patient", "name email phone");

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("❌ Fetch appointments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// ✅ BOOK appointment
router.post("/book", async (req, res) => {
  try {
    const { patient, doctor, datetime, email, phone, medicine } = req.body;

    if (!patient || !doctor || !datetime || !email)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const patientDoc = await Patient.findById(patient);
    const doctorDoc = await Doctor.findById(doctor);

    if (!patientDoc || !doctorDoc)
      return res.status(404).json({ success: false, message: "Invalid patient or doctor ID" });

    const appointment = await Appointment.create({
      patient,
      doctor,
      datetime,
      email,
      phone,
      medicine,
      videoChannel: `${patient}_${Date.now()}`,
    });

      // ✅ Populate it (ensure full data before sending)
    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization email");

    console.log("🩺 Appointment created:", appointment);
    console.log("🧠 Populated appointment:", populated);
    console.log("🎯 Sending appointment ID:", populated?._id);  
    // Send confirmation mail
try {
 await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: `💎 Appointment Confirmed — ${doctorDoc.name} Awaits You`,
  html: `
  <!-- ✅ Fully Email-Safe Appointment Confirmation -->
  <div style="margin:0;padding:0;background:#f4fbf9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:30px 10px;">
          <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.08);border:1px solid #eaf2ef;">

            <!-- HEADER -->
            <tr>
              <td bgcolor="#00bfa6" style="background:linear-gradient(135deg,#00bfa6,#00a2e0);padding:50px 40px;color:#ffffff;text-align:left;">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="70" valign="top" align="left">
                      <img src="https://cdn-icons-png.flaticon.com/512/2966/2966488.png" alt="Healthcare" width="60" height="60" style="display:block;border-radius:14px;">
                    </td>
                    <td align="left" style="padding-left:20px;">
                      <h1 style="margin:0;font-size:26px;font-weight:700;">Appointment Confirmed</h1>
                      <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">Your online consultation is successfully booked 🎉</p>
                    </td>
                    <td align="right" valign="top" style="text-align:right;">
                      <span style="background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:9999px;font-size:13px;font-weight:600;">✅ Confirmed</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:50px 40px 40px;color:#1a1a1a;">
                <p style="font-size:16px;margin:0 0 8px;">Dear <strong>${patientDoc.name}</strong>,</p>
                <p style="font-size:15px;color:#555;margin-bottom:30px;line-height:1.6;">
                  We're delighted to confirm your consultation with <strong>${doctorDoc.name}</strong>.<br/>
                  Please review your session details below and join the call on time.
                </p>

                <!-- Doctor Card -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:30px;">
                  <tr>
                    <td valign="top" width="50%" style="padding-right:10px;">
                      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fffb;border:1px solid #def3ed;border-radius:16px;">
                        <tr>
                          <td style="padding:18px;">
                            <table cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td width="70" valign="top">
                                  <img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="Doctor" width="70" height="70" style="border-radius:12px;display:block;">
                                </td>
                                <td style="padding-left:15px;vertical-align:top;">
                                  <div style="font-size:16px;font-weight:600;">${doctorDoc.name}</div>
                                  <div style="font-size:13px;color:#555;">${doctorDoc.specialization}</div>
                                  <div style="margin-top:6px;font-size:12px;background:#e9fdf6;color:#008a73;border-radius:9999px;display:inline-block;padding:4px 10px;">🟢 Teleconsultation</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>

                    <!-- Appointment Info -->
                    <td valign="top" width="50%" style="padding-left:10px;">
                      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e8f5f2;border-radius:16px;">
                        <tr><td style="padding:18px;">
                          <p style="margin:0 0 8px;font-size:14px;">📅 <strong>Date & Time:</strong></p>
                          <p style="margin:0 0 12px;font-size:15px;color:#111;">${new Date(datetime).toLocaleString()}</p>
                          <p style="margin:0 0 8px;font-size:14px;">📞 <strong>Phone:</strong></p>
                          <p style="margin:0 0 12px;font-size:15px;color:#111;">${phone || "N/A"}</p>
                          <p style="margin:0 0 8px;font-size:14px;">✉️ <strong>Email:</strong></p>
                          <p style="margin:0 0 12px;font-size:15px;color:#111;">${email}</p>
                          ${
                            medicine
                              ? `<p style="margin:0 0 8px;font-size:14px;">💊 <strong>Prescribed:</strong></p>
                                 <p style="margin:0;font-size:15px;color:#009d83;">${medicine}</p>`
                              : ""
                          }
                        </td></tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- CTA BUTTON -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:40px auto;">
                  <tr>
                    <td align="center" bgcolor="#00bfa6" style="border-radius:50px;">
                      <a href="https://healthcareappointment.vercel.app/video/${appointment._id}" target="_blank"
                        style="font-size:16px;font-weight:600;text-decoration:none;color:#ffffff;background:linear-gradient(90deg,#00bfa6,#00a2e0);padding:14px 38px;border-radius:50px;display:inline-block;">
                        🎥 Join Video Consultation
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- TIP BOX -->
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ecfdf7;border-radius:14px;margin-top:20px;">
                  <tr>
                    <td style="padding:16px 20px;font-size:13px;color:#007e66;line-height:1.6;">
                      💡 <strong>Tip:</strong> Join 5 minutes early, ensure your mic and camera are active, and choose a quiet, well-lit spot for the best experience.
                    </td>
                  </tr>
                </table>

                <!-- ACTION LINKS -->
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;">
                  <tr>
                    <td align="left" style="font-size:14px;color:#555;">
                      Need to reschedule? <a href="#" style="color:#0078d7;text-decoration:none;font-weight:500;">Manage Booking</a>
                    </td>
                    <td align="right">
                          <a href="https://healthcareappointment.vercel.app/api/appointments/${appointment._id}/calendar"
   style="font-size:13px;color:#333;text-decoration:none;border:1px solid #ddd;padding:8px 14px;border-radius:8px;">
   📅 Add to Calendar
</a>
&nbsp;
<a href="https://healthcareappointment.vercel.app/api/appointments/${appointment._id}/receipt"
   style="font-size:13px;color:#333;text-decoration:none;border:1px solid #ddd;padding:8px 14px;border-radius:8px;">
   🧾 Download Receipt
</a>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td bgcolor="#f9fafb" style="padding:24px 20px;border-top:1px solid #edf1f2;text-align:center;font-size:13px;color:#666;">
                © ${new Date().getFullYear()} <strong>HealthPrime</strong> • 
                <a href="#" style="color:#0078d7;text-decoration:none;">Privacy</a> • 
                <a href="#" style="color:#0078d7;text-decoration:none;">Support</a>
              </td>
            </tr>
          </table>

          <p style="font-size:12px;color:#8f8f8f;text-align:center;margin-top:10px;">View beautifully on mobile or desktop 💚</p>
        </td>
      </tr>
    </table>
  </div>
  `,
});

} catch (e) {
  console.warn("⚠️ Email not sent:", e.message);
}
    res.status(201).json({
      success: true,
      appointment: {
        _id: populated._id,
        patient: { _id: populated.patient._id, name: populated.patient.name },
        doctor: { _id: populated.doctor._id, name: populated.doctor.name },
        datetime: populated.datetime,
        medicine: populated.medicine,
        phone: populated.phone,
        email: populated.email,
        status: populated.status,
      },
    });
  } catch (err) {
    console.error("❌ Error booking appointment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
