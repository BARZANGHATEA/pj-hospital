import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { HttpError, requireSession, requireVerifiedDoctor } from "@/lib/auth"
import { assertObjectId, withErrors } from "@/lib/api"
import { forPatient } from "@/lib/prescriptions"
import { reviewSchema } from "@/lib/validations"
import Chat from "@/models/Chat"
import Prescription from "@/models/Prescription"
import "@/models/User"

type Ctx = { params: Promise<{ id: string }> }

export const GET = withErrors(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession()
  const { id } = await params
  assertObjectId(id)
  await connectDB()

  if (session.role === "patient") {
    const prescription = await Prescription.findOne({ _id: id, patientId: session.sub })
      .populate("doctorId", "name specialty")
      .lean()
    if (!prescription) throw new HttpError(404, "نسخه یافت نشد")
    return NextResponse.json({ prescription: forPatient(prescription) })
  }

  await requireVerifiedDoctor()
  const prescription = await Prescription.findById(id)
    .populate("patientId", "name age gender phone medicalHistory currentMedications")
    .populate("doctorId", "name specialty")
    .lean()
  if (!prescription) throw new HttpError(404, "نسخه یافت نشد")
  const chat = await Chat.findById(prescription.chatId).select("messages").lean()
  return NextResponse.json({ prescription, messages: chat?.messages ?? [] })
})

export const PATCH = withErrors(async (req: Request, { params }: Ctx) => {
  const session = await requireVerifiedDoctor()
  const { id } = await params
  assertObjectId(id)
  const review = reviewSchema.parse(await req.json())
  await connectDB()

  const update: Record<string, unknown> = {
    status: review.action === "approve" ? "approved" : "rejected",
    doctorId: session.sub,
    doctorNotes: review.doctorNotes ?? "",
    reviewedAt: new Date(),
  }
  if (review.diagnosis !== undefined) update.diagnosis = review.diagnosis
  if (review.medications !== undefined) update.medications = review.medications

  // Only a pending prescription can be reviewed, and only once.
  const prescription = await Prescription.findOneAndUpdate({ _id: id, status: "pending" }, update, { new: true }).lean()
  if (!prescription) {
    const exists = await Prescription.exists({ _id: id })
    throw exists ? new HttpError(409, "این نسخه قبلاً بررسی شده است") : new HttpError(404, "نسخه یافت نشد")
  }
  await Chat.updateOne({ _id: prescription.chatId }, { status: "reviewed" })

  return NextResponse.json({ prescription })
})
