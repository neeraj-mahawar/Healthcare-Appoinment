import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }, // ✅ Added for email verification
     availableSlots: [
      {
        date: { type: Date, required: true },
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
