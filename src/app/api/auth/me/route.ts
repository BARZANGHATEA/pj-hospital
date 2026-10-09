import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { HttpError, requireSession } from "@/lib/auth"
import { withErrors } from "@/lib/api"
import User from "@/models/User"

export const GET = withErrors(async () => {
  const session = await requireSession()
  await connectDB()
  const user = await User.findById(session.sub).lean()
  if (!user) throw new HttpError(401, "حساب کاربری یافت نشد")
  return NextResponse.json({ user })
})
