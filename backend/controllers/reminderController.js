import mongoose from "mongoose";
import Reminder from "../models/Reminder.js";

// ✅ Get all reminders (pending + completed)
export const getReminders = async (req, res) => {
  const { userId } = req.params;

  try {
    const allReminders = await Reminder.find({ userId });

    const pending = allReminders
      .filter((r) => !r.completed)
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    const completed = allReminders
      .filter((r) => r.completed)
      .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));

    res.json({ success: true, pending, completed });
  } catch (err) {
    console.error("❌ Error fetching reminders:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reminders" });
  }
};

// ✅ Mark reminder as complete
export const completeReminder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid reminder ID" });
  }

  try {
    const updated = await Reminder.findByIdAndUpdate(
      id,
      { completed: true, takenAt: new Date() },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found" });
    }

    res.json({ success: true, reminder: updated });
  } catch (err) {
    console.error("❌ Error completing reminder:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark reminder as taken" });
  }
};
