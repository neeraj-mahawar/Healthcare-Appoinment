import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientName: { type: String, required: true },
  datetime: { type: Date, required: true },
  notes: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);