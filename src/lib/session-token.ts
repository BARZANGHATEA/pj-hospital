import { SignJWT, jwtVerify } from "jose"

// Edge-safe helpers (used by middleware), so this file must not import
// Node-only modules such as mongoose or bcrypt.

export const SESSION_COOKIE = "session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type Role = "patient" | "doctor"

export type SessionPayload = {
  sub: string
  role: Role
  name: string
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.")
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] })
    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "patient" && payload.role !== "doctor") ||
      typeof payload.name !== "string"
    ) {
      return null
    }
    return { sub: payload.sub, role: payload.role, name: payload.name }
  } catch {
    return null
  }
}

export function dashboardPath(role: Role) {
  return role === "doctor" ? "/doctor" : "/patient"
}
