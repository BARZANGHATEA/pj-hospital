import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["patient", "doctor"],
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  gender: { type: String }, // For patients
  age: { type: Number }, // For patients
  specialty: { type: String }, // For doctors
  licenseNumber: { type: String }, // For doctors
  phone: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
