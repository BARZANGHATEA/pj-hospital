import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { HttpError, requireSession } from "@/lib/auth"
import { assertObjectId, withErrors } from "@/lib/api"
import { intakeReply } from "@/lib/ai"
import { chatMessageSchema } from "@/lib/validations"
import Chat from "@/models/Chat"
import User from "@/models/User"

type Ctx = { params: Promise<{ id: string }> }

// Keeps a single consultation (and its cost) bounded.
const MAX_MESSAGES = 60

export const POST = withErrors(async (req: Request, { params }: Ctx) => {
  const session = await requireSession("patient")
  const { id } = await params
  assertObjectId(id)
  const { text } = chatMessageSchema.parse(await req.json())
  await connectDB()

  const chat = await Chat.findOneAndUpdate(
    { _id: id, patientId: session.sub, status: "open", [`messages.${MAX_MESSAGES - 1}`]: { $exists: false } },
    { $push: { messages: { from: "patient", text } } },
    { new: true },
  )
  if (!chat) {
    const exists = await Chat.findOne({ _id: id, patientId: session.sub }).select("status").lean()
    if (!exists) throw new HttpError(404, "گفتگو یافت نشد")
    if (exists.status !== "open") throw new HttpError(409, "این گفتگو برای پزشک ارسال شده و بسته است")
    throw new HttpError(409, "گفتگو به حداکثر طول رسیده است. لطفاً آن را برای پزشک ارسال کنید.")
  }
  const patientMessage = chat.messages[chat.messages.length - 1]

  const patient = await User.findById(session.sub).lean()
  if (!patient) throw new HttpError(401, "حساب کاربری یافت نشد")

  let reply: string
  try {
    reply = await intakeReply(
      patient,
      chat.messages.map((m) => ({ from: m.from as "patient" | "ai", text: m.text })),
    )
  } catch (error) {
    // Roll back so the patient can resend without leaving an unanswered turn behind.
    await Chat.updateOne({ _id: chat._id }, { $pull: { messages: { _id: patientMessage._id } } })
    throw error
  }

  const updated = await Chat.findByIdAndUpdate(
    chat._id,
    { $push: { messages: { from: "ai", text: reply } } },
    { new: true },
  ).lean()

  return NextResponse.json({ messages: updated?.messages ?? [] })
})
