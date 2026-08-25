import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",   // ✅ Make sure model name matches exactly
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",    // ✅ Must match the Doctor model name
      required: true,
    },
    datetime: { type: Date, required: true },
    medicine: { type: String , required:true },
    phone: { type: String },
    email: { type: String },
    status: {
  type: String,
  enum: ["pending", "completed", "cancelled"],
  default: "pending",
},

    videoChannel: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
