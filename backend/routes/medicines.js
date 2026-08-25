import express from "express";
import Medicine from "../models/Medicine.js";
import cron from "node-cron";
import nodemailer from "nodemailer";
import Reminder from "../models/Reminder.js";
import Patient from "../models/Patient.js"; // ✅ import Patient

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all medicines for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const medicines = await Medicine.find({ userId });

    // Always return an array, even if empty
    res.json({ success: true, medicines });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Add a new medicine
router.post("/add", async (req, res) => {
  try {
    let { userId, name, dose, times } = req.body;

    if (!Array.isArray(times)) times = times.map((t) => t.trim());
    times = [...new Set(times)]; // unique times

    // Fetch patient email
    const patient = await Patient.findById(userId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const newMed = await Medicine.create({
      userId,
      name,
      dose,
      times,
      email: patient.email, // store patient email automatically
    });

    // Create reminders
    const reminderDocs = times.map((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const t = new Date();
      t.setHours(hour, minute, 0, 0);
      if (t < new Date()) t.setDate(t.getDate() + 1);
      return {
        userId,
        medicineId: newMed._id,
        title: name,
        dose,
        time: t,
        completed: false,
      };
    });

    await Reminder.insertMany(reminderDocs);

    res.json({ success: true, medicine: newMed });
  } catch (err) {
    console.error("Error adding medicine and reminders:", err);
    res.status(500).json({ success: false, message: "Failed to add medicine" });
  }
});

// Cron job for email reminders every minute
// ✅ Cron job for email reminders every minute (with IST + better logic)
// ✅ Improved Cron Job – Accurate IST Time + Reliable Email Trigger + Detailed Logging
cron.schedule("* * * * *", async () => {
  try {
    // Get current time in IST reliably (no math errors)
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const hours = nowIST.getHours();
    const minutes = nowIST.getMinutes();
    const nowMinutes = hours * 60 + minutes;

    console.log(
      `🕒 [${nowIST.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] Checking reminders...`
    );

    const medicines = await Medicine.find({});
    if (!medicines.length) {
      console.log("ℹ️ No medicines found in database.");
      return;
    }

    for (const med of medicines) {
      const patient = await Patient.findById(med.userId);
      if (!patient) {
       
        continue;
      }

      const patientName = patient.name || "User";
      const patientEmail = patient.email || med.email;
      if (!patientEmail) {
        console.warn(`⚠️ Skipping ${med.name} — no email for ${patientName}`);
        continue;
      }

      for (const time of med.times) {
        const [hour, minute] = time.split(":").map(Number);
        const medMinutes = hour * 60 + minute;
        const diff = Math.abs(nowMinutes - medMinutes);

        // ✅ 2-minute tolerance to avoid missing due to small lags
        if (diff <= 2) {
          console.log(`📧 Sending reminder → ${patientEmail} for ${med.name} (${time})`);

          const mailOptions = {
            from: `"Health Tracker" <${process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: `💊 Reminder: Take ${med.name} (${med.dose})`,
html: `
<!-- ✅ Fully Email-Safe Medicine Reminder Email -->
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
                    <img src="https://cdn-icons-png.flaticon.com/512/2966/2966488.png" alt="Medicine" width="60" height="60" style="display:block;border-radius:14px;">
                  </td>
                  <td align="left" style="padding-left:20px;">
                    <h1 style="margin:0;font-size:26px;font-weight:700;">Medicine Reminder</h1>
                    <p style="margin:8px 0 0;font-size:15px;opacity:0.95;">Stay on track with your health, ${patientName}! 💚</p>
                  </td>
                  <td align="right" valign="top" style="text-align:right;">
                    <span style="background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:9999px;font-size:13px;font-weight:600;">💊 Reminder</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:50px 40px 40px;color:#1a1a1a;">
              <p style="font-size:16px;margin:0 0 8px;">Dear <strong>${patientName}</strong>,</p>
              <p style="font-size:15px;color:#555;margin-bottom:30px;line-height:1.6;">
                This is a gentle reminder to take your prescribed medicine on time for your continued well-being 🌿.
              </p>

              <!-- MEDICINE CARD -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:30px;">
                <tr>
                  <td width="100%">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fffb;border:1px solid #def3ed;border-radius:16px;">
                      <tr>
                        <td style="padding:18px;">
                          <table cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="70" valign="top">
                                <img src="https://cdn-icons-png.flaticon.com/512/2966/2966488.png" alt="Pill" width="70" height="70" style="border-radius:12px;display:block;">
                              </td>
                              <td style="padding-left:15px;vertical-align:top;">
                                <div style="font-size:16px;font-weight:600;">💊 ${med.name}</div>
                                <div style="font-size:14px;color:#555;margin-top:6px;">🕒 <strong>Dose:</strong> ${med.dose}</div>
                                <div style="font-size:14px;color:#111;margin-top:6px;">⏰ <strong>Time:</strong> ${time}</div>
                                <div style="margin-top:10px;font-size:12px;background:#e9fdf6;color:#008a73;border-radius:9999px;display:inline-block;padding:4px 10px;">💚 Stay consistent</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:40px auto;">
                <tr>
                  <td align="center" bgcolor="#00bfa6" style="border-radius:50px;">
                    <a href="https://healthcareappointment.vercel.app/medicines" target="_blank"
                      style="font-size:16px;font-weight:600;text-decoration:none;color:#ffffff;background:linear-gradient(90deg,#00bfa6,#00a2e0);padding:14px 38px;border-radius:50px;display:inline-block;">
                      🩺 View Your Medicines
                    </a>
                  </td>
                </tr>
              </table>

              <!-- HEALTH TIP -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ecfdf7;border-radius:14px;margin-top:20px;">
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:#007e66;line-height:1.6;">
                    💡 <strong>Health Tip:</strong> Stay hydrated, eat balanced meals, and store your medicines in a cool, dry place for best effectiveness.
                  </td>
                </tr>
              </table>

              <!-- ACTION LINKS -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;">
                <tr>
                  <td align="left" style="font-size:14px;color:#555;">
                    Missed a dose? <a href="https://healthcareappointment.vercel.app/medicines" style="color:#0078d7;text-decoration:none;font-weight:500;">Update Log</a>
                  </td>
                  <td align="right">
                    <a href="#" style="font-size:13px;color:#333;text-decoration:none;border:1px solid #ddd;padding:8px 14px;border-radius:8px;">⏰ Snooze Reminder</a>
                    &nbsp;
                    <a href="#" style="font-size:13px;color:#333;text-decoration:none;border:1px solid #ddd;padding:8px 14px;border-radius:8px;">📅 Add to Calendar</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td bgcolor="#f9fafb" style="padding:24px 20px;border-top:1px solid #edf1f2;text-align:center;font-size:13px;color:#666;">
              © ${new Date().getFullYear()} <strong>Auraa Health Tracker</strong> • 
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

`

          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to ${patientEmail}`);
          } catch (err) {
            console.error(`❌ Failed to send email to ${patientEmail}:`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error("🔥 Cron job failed:", err);
  }
});




export default router;
