import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { createSession, hashPassword } from "@/lib/auth"
import { jsonError, withErrors } from "@/lib/api"
import { registerSchema } from "@/lib/validations"
import User from "@/models/User"

export const POST = withErrors(async (req: Request) => {
  const { password, ...data } = registerSchema.parse(await req.json())
  await connectDB()

  if (await User.exists({ email: data.email })) {
    return jsonError(409, "این ایمیل قبلاً ثبت شده است")
  }

  const user = await User.create({ ...data, passwordHash: await hashPassword(password) })
  await createSession({ sub: user.id, role: user.role, name: user.name })

  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } }, { status: 201 })
})
