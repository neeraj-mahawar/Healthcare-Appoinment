import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true },
    dose: { type: String, required: true },
    times: [{ type: String, required: true }],
    email: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
