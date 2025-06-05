import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
});

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  generatedByAI: { type: Boolean, default: true },
  diagnosis: { type: String },
  medications: [MedicationSchema],
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
