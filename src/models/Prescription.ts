import mongoose, { type InferSchemaType, type Model } from "mongoose"

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
}, { _id: false })

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  generatedByAI: { type: Boolean, default: true },
  symptomsSummary: { type: String },
  diagnosis: { type: String },
  urgency: { type: String, enum: ["low", "medium", "high", "emergency"], default: "low" },
  recommendations: { type: String },
  medications: [MedicationSchema],
  // An AI draft is never shown to the patient as a prescription until a doctor approves it.
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  doctorNotes: { type: String },
  reviewedAt: { type: Date },
}, { timestamps: true })

export type PrescriptionDoc = InferSchemaType<typeof PrescriptionSchema>

const Prescription =
  (mongoose.models.Prescription as Model<PrescriptionDoc>) ||
  mongoose.model<PrescriptionDoc>("Prescription", PrescriptionSchema)
export default Prescription
