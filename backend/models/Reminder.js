// backend/models/Reminder.js
import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true }, // changed to Patient
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  title: { type: String, required: true },
  dose: { type: String, required: true },
  time: { type: Date, required: true },
  takenAt: { type: Date },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Reminder", reminderSchema);
