import express from "express";
import multer from "multer";
import chalk from "chalk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse-fixed";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromPDF(buffer) {
  console.log(chalk.cyan("[DEBUG] extractTextFromPDF() called..."));
  try {
    const data = await pdfParse(buffer); // Parse directly from uploaded buffer
    console.log(
      chalk.greenBright(
        `[DEBUG] PDF extraction complete (length: ${data.text.length})`,
      ),
    );
    return data.text || "";
  } catch (err) {
    console.error(chalk.red("[DEBUG] PDF extraction error:"), err);
    throw new Error("PDF extraction failed: " + err.message);
  }
}

router.post("/summarize", upload.single("report"), async (req, res) => {
  console.log(chalk.bgBlue.white.bold("\n[DEBUG] /summarize route hit"));

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log(
      "[DEBUG] File received:",
      req.file.originalname,
      "(",
      req.file.mimetype,
      ")",
    );

    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else {
      extractedText = req.file.buffer.toString("utf8");
    }

    if (!extractedText || extractedText.trim().length < 5) {
      return res
        .status(400)
        .json({ error: "Could not extract text from file." });
    }

    console.log("[DEBUG] Sending prompt to Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = `You are a kind doctor. Explain this medical report in a simple way:\n${extractedText}`;
    const result = await model.generateContent(prompt);
    const summary = result.response?.text?.().trim?.() || "AI response failed";

    console.log("[DEBUG] AI response length:", summary.length);
    res.json({ summary });
  } catch (err) {
    console.error(chalk.red("[DEBUG] Summarization failed:"), err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
