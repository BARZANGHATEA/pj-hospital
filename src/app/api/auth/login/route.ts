import { NextResponse } from "next/server"
import { z } from "zod"
import { connectDB } from "@/lib/db"
import { createSession, verifyPassword } from "@/lib/auth"
import { jsonError, withErrors } from "@/lib/api"
import { loginSchema } from "@/lib/validations"
import User from "@/models/User"

const bodySchema = loginSchema.extend({ role: z.enum(["patient", "doctor"]) })

export const POST = withErrors(async (req: Request) => {
  const { email, password, role } = bodySchema.parse(await req.json())
  await connectDB()

  const user = await User.findOne({ email }).select("+passwordHash")
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError(401, "ایمیل یا رمز عبور اشتباه است")
  }
  if (user.role !== role) {
    return jsonError(403, role === "doctor"
      ? "این حساب متعلق به بیمار است. از صفحه ورود بیماران وارد شوید."
      : "این حساب متعلق به پزشک است. از صفحه ورود پزشکان وارد شوید.")
  }

  await createSession({ sub: user.id, role: user.role, name: user.name })
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } })
})
