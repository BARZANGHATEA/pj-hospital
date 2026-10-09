// Marks a doctor account as verified after their medical license has been checked.
// Usage: npm run verify-doctor -- doctor@example.com
import mongoose from "mongoose"

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error("Usage: npm run verify-doctor -- <email>")
  process.exit(1)
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (expected in .env.local).")
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI)
const result = await mongoose.connection
  .collection("users")
  .findOneAndUpdate({ email, role: "doctor" }, { $set: { verified: true } }, { returnDocument: "after" })

if (!result) {
  console.error(`No doctor account found for ${email}`)
  process.exitCode = 1
} else {
  console.log(`Verified Dr. ${result.name} (${result.email}, license ${result.licenseNumber ?? "-"})`)
}
await mongoose.disconnect()
