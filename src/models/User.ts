import mongoose, { type InferSchemaType, type Model } from "mongoose"

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["patient", "doctor"],
    required: true,
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String },
  // Patients
  gender: { type: String, enum: ["male", "female"] },
  age: { type: Number, min: 0, max: 130 },
  medicalHistory: { type: String },
  currentMedications: { type: String },
  // Doctors
  specialty: { type: String },
  licenseNumber: { type: String },
  clinicAddress: { type: String },
  bio: { type: String },
  // Doctors can't see patient cases until an admin verifies their license
  // (npm run verify-doctor -- <email>).
  verified: { type: Boolean, default: false },
}, { timestamps: true })

export type UserDoc = InferSchemaType<typeof UserSchema>

const User = (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema)
export default User
