// routes/reminderRoutes.js
import express from "express";
import { getReminders, completeReminder } from "../controllers/reminderController.js";

const router = express.Router();

// Get reminders
router.get("/:userId", getReminders);

// Complete reminder
router.put("/:id/complete", completeReminder);

export default router;
