// backend/routes/voiceBooking.js
import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

/* -----------------------------------------------------
 🧠 Initialize Gemini AI
----------------------------------------------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/* -----------------------------------------------------
 🧩 /interpret — Understand & Respond
----------------------------------------------------- */
router.post("/interpret", async (req, res) => {
  try {
    const { text = "", gender = "female" } = req.body;
    if (!text.trim()) return res.status(400).json({ error: "No text provided" });

    const prompt = `
You are "UvCare Voice AI", a polite bilingual (Hindi-English) healthcare assistant.
Understand user intent from: "${text}"

Output must be JSON:
{
  "action": "book"|"cancel"|"list"|"medicine",
  "doctorName": "<string>",
  "date": "<yyyy-mm-dd | today | tomorrow>",
  "time": "<hh:mm>",
  "medicine": "<string>"
}
`;

    /* -----------------------------------------------------
      ✅ RETRY LOGIC FOR GEMINI (Fix for 503 overload)
    ----------------------------------------------------- */
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error("❌ Gemini Error:", err);

      // Gemini overloaded (503)
      if (err.status === 503) {
        return res.json({
          parsed: { action: "unknown" },
          responseText:
            "⚠️ The AI service is temporarily overloaded. Please try again in a moment.",
        });
      }

      // Any other Gemini issue
      return res.status(500).json({
        error: "AI model failed to process the request",
        details: err.message,
      });
    }

    /* -----------------------------------------------------
      Extract text safely
    ----------------------------------------------------- */
    let output = "";
    try {
      output = result.response.text().replace(/```json|```/g, "").trim();
    } catch {
      output = "{}";
    }

    /* -----------------------------------------------------
      Parse JSON from AI response
    ----------------------------------------------------- */
    let parsed;
    try {
      parsed = JSON.parse(output.match(/\{[\s\S]*\}/)?.[0] || "{}");
    } catch (e) {
      parsed = {};
    }

    /* -----------------------------------------------------
      Doctor name detection fallback
    ----------------------------------------------------- */
    if (!parsed.doctorName || parsed.doctorName.trim() === "") {
      const docMatch =
        text.match(/(dr\.?\s*[A-Z]?[a-z]+|डॉक्टर\s*[A-Z]?[a-z]+)/i) ||
        text.match(/doctor\s*[A-Z]?[a-z]+/i);
      if (docMatch) parsed.doctorName = docMatch[0].replace(/dr\.?\s*/i, "Dr. ");
    }

    /* -----------------------------------------------------
      Detect Action Fallback (manual NLP)
    ----------------------------------------------------- */
    if (!parsed.action) {
      if (/book|appointment/i.test(text)) parsed.action = "book";
      else if (/cancel|radd/i.test(text)) parsed.action = "cancel";
      else if (/list|available/i.test(text)) parsed.action = "list";
      else if (/medicine|tablet|dawai|drug/i.test(text)) parsed.action = "medicine";
      else parsed.action = "unknown";
    }

    /* -----------------------------------------------------
      Normalize Date / Time
    ----------------------------------------------------- */
    const today = new Date();
    if (parsed.date?.toLowerCase() === "today") {
      parsed.date = today.toISOString().split("T")[0];
    } else if (parsed.date?.toLowerCase() === "tomorrow") {
      const t = new Date(today);
      t.setDate(today.getDate() + 1);
      parsed.date = t.toISOString().split("T")[0];
    }

    if (!parsed.time) parsed.time = "10:00";

    /* -----------------------------------------------------
      Create a Natural Response
    ----------------------------------------------------- */
    let responseText = "";
    const isHindi = /[\u0900-\u097F]/.test(text);

    switch (parsed.action) {
      case "book":
        responseText = isHindi
          ? `✅ आपकी अपॉइंटमेंट डॉक्टर ${
              parsed.doctorName || "उपलब्ध डॉक्टर"
            } के साथ ${parsed.date} को ${parsed.time} पर बुक कर दी गई है।`
          : `✅ Appointment booked with ${
              parsed.doctorName || "the doctor"
            } on ${parsed.date} at ${parsed.time}.`;
        break;

      case "cancel":
        responseText = isHindi
          ? "ठीक है, आपकी अपॉइंटमेंट रद्द कर दी गई है।"
          : "Okay, your appointment has been cancelled.";
        break;

      case "list":
        responseText = isHindi
          ? "आज के लिए उपलब्ध डॉक्टरों की सूची ये रही।"
          : "Here’s the list of available doctors today.";
        break;

      case "medicine":
        responseText = isHindi
          ? `आपकी प्रिस्क्रिप्शन में दवाई ${
              parsed.medicine || "निर्दिष्ट नहीं"
            } जोड़ दी गई है।`
          : `Medicine ${parsed.medicine || "unspecified"} has been added.`;
        break;

      default:
        responseText = isHindi
          ? "माफ़ कीजिए, मैं आपका आदेश समझ नहीं पाई।"
          : "Sorry, I did not understand your request.";
    }

    // Add polite ending
    if (parsed.action === "book") {
      responseText += gender === "male"
        ? " Appointment confirmed, sir."
        : " Appointment confirmed, ma’am.";
    }

    return res.json({ parsed, responseText });
  } catch (err) {
    console.error("❌ /interpret Fatal Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
});

/* -----------------------------------------------------
 🗣️ /speak (simple)
----------------------------------------------------- */
router.post("/speak", (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "No text provided" });

    res.json({ audioBase64: null, responseText: text });
  } catch (err) {
    console.error("❌ /speak Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
