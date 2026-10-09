import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireSession } from "@/lib/auth"
import { withErrors } from "@/lib/api"
import Chat from "@/models/Chat"

const GREETING =
  "سلام! من دستیار هوشمند پذیرش هستم. لطفاً مشکل یا علائمی که دارید را توضیح دهید تا اطلاعات لازم را برای پزشک آماده کنم.\n" +
  "اگر علائم اورژانسی مانند درد قفسه سینه، تنگی نفس شدید یا بی‌هوشی دارید، همین حالا با ۱۱۵ تماس بگیرید."

export const GET = withErrors(async () => {
  const session = await requireSession("patient")
  await connectDB()
  const chats = await Chat.find({ patientId: session.sub })
    .select("title status createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean()
  return NextResponse.json({ chats })
})

export const POST = withErrors(async () => {
  const session = await requireSession("patient")
  await connectDB()
  const chat = await Chat.create({
    patientId: session.sub,
    messages: [{ from: "ai", text: GREETING }],
  })
  return NextResponse.json({ chat: { _id: chat.id } }, { status: 201 })
})
