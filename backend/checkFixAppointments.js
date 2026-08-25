// fixObjectIds.js
import mongoose from "mongoose";
import Appointment from "./models/Appointment.js";

await mongoose.connect("mongodb://127.0.0.1:27017/your_db_name");

const appointments = await Appointment.find();
for (let a of appointments) {
  if (typeof a.patient === "string") a.patient = new mongoose.Types.ObjectId(a.patient);
  if (typeof a.doctor === "string") a.doctor = new mongoose.Types.ObjectId(a.doctor);
  await a.save();
}
console.log("✅ All IDs converted to ObjectId");
process.exit();
