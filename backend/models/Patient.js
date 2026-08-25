import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  gender: { type: String },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
  isVerified: {
  type: Boolean,
  default: false,
},
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
