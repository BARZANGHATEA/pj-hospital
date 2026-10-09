import "server-only"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type Role,
  type SessionPayload,
} from "@/lib/session-token"

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession() {
  const cookieStore = await cookies()
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value)
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

/** Returns the current session, or throws a 401/403 HttpError. */
export async function requireSession(role?: Role) {
  const session = await getSession()
  if (!session) throw new HttpError(401, "ابتدا وارد حساب کاربری خود شوید")
  if (role && session.role !== role) throw new HttpError(403, "شما به این بخش دسترسی ندارید")
  return session
}

/** Like requireSession("doctor"), but also requires an admin-verified license. */
export async function requireVerifiedDoctor() {
  const session = await requireSession("doctor")
  await connectDB()
  const doctor = await User.findById(session.sub).select("verified").lean()
  if (!doctor?.verified) {
    throw new HttpError(403, "حساب پزشکی شما هنوز تأیید نشده است. پس از بررسی شماره نظام پزشکی، دسترسی شما فعال می‌شود.")
  }
  return session
}
