import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireSession, requireVerifiedDoctor } from "@/lib/auth"
import { withErrors } from "@/lib/api"
import { byUrgencyThenAge, forPatient } from "@/lib/prescriptions"
import Prescription from "@/models/Prescription"
import "@/models/User"

export const GET = withErrors(async (req: Request) => {
  const session = await requireSession()
  await connectDB()

  if (session.role === "patient") {
    const prescriptions = await Prescription.find({ patientId: session.sub })
      .populate("doctorId", "name specialty")
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ prescriptions: prescriptions.map(forPatient) })
  }

  // Doctors: the shared queue of pending cases, or the cases they reviewed.
  await requireVerifiedDoctor()
  const scope = new URL(req.url).searchParams.get("scope") === "reviewed" ? "reviewed" : "pending"
  if (scope === "pending") {
    const prescriptions = await Prescription.find({ status: "pending" })
      .populate("patientId", "name age gender")
      .limit(200)
      .lean()
    return NextResponse.json({ prescriptions: prescriptions.sort(byUrgencyThenAge) })
  }

  const prescriptions = await Prescription.find({ doctorId: session.sub, status: { $ne: "pending" } })
    .populate("patientId", "name age gender")
    .sort({ reviewedAt: -1 })
    .limit(200)
    .lean()
  return NextResponse.json({ prescriptions })
})
