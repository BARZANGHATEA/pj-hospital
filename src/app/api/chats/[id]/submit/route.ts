import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { HttpError, requireSession } from "@/lib/auth"
import { assertObjectId, withErrors } from "@/lib/api"
import { summarizeCase } from "@/lib/ai"
import Chat from "@/models/Chat"
import Prescription from "@/models/Prescription"
import User from "@/models/User"

type Ctx = { params: Promise<{ id: string }> }

export const POST = withErrors(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession("patient")
  const { id } = await params
  assertObjectId(id)
  await connectDB()

  // Flip the status first so a double click cannot create two prescriptions.
  const chat = await Chat.findOneAndUpdate(
    { _id: id, patientId: session.sub, status: "open", "messages.from": "patient" },
    { status: "submitted" },
    { new: true },
  )
  if (!chat) {
    const exists = await Chat.findOne({ _id: id, patientId: session.sub }).select("status").lean()
    if (!exists) throw new HttpError(404, "گفتگو یافت نشد")
    if (exists.status !== "open") throw new HttpError(409, "این گفتگو قبلاً برای پزشک ارسال شده است")
    throw new HttpError(400, "ابتدا علائم خود را برای دستیار توضیح دهید")
  }

  try {
    const patient = await User.findById(session.sub).lean()
    if (!patient) throw new HttpError(401, "حساب کاربری یافت نشد")

    const summary = await summarizeCase(
      patient,
      chat.messages.map((m) => ({ from: m.from as "patient" | "ai", text: m.text })),
    )

    const prescription = await Prescription.create({
      patientId: session.sub,
      chatId: chat._id,
      generatedByAI: true,
      symptomsSummary: summary.symptomsSummary,
      diagnosis: summary.preliminaryDiagnosis,
      urgency: summary.urgency,
      recommendations: summary.recommendations,
      medications: summary.suggestedMedications,
    })
    await Chat.updateOne({ _id: chat._id }, { title: summary.title, symptomsSummary: summary.symptomsSummary })

    return NextResponse.json({ prescriptionId: prescription.id }, { status: 201 })
  } catch (error) {
    await Chat.updateOne({ _id: chat._id }, { status: "open" })
    throw error
  }
})
