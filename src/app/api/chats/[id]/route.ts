import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { HttpError, requireSession } from "@/lib/auth"
import { assertObjectId, withErrors } from "@/lib/api"
import Chat from "@/models/Chat"

type Ctx = { params: Promise<{ id: string }> }

export const GET = withErrors(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession("patient")
  const { id } = await params
  assertObjectId(id)
  await connectDB()
  const chat = await Chat.findOne({ _id: id, patientId: session.sub }).lean()
  if (!chat) throw new HttpError(404, "گفتگو یافت نشد")
  return NextResponse.json({ chat })
})
