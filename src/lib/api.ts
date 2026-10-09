import "server-only"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { ZodError } from "zod"
import { HttpError } from "@/lib/auth"

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status })
}

/** Wraps a route handler so thrown HttpErrors / ZodErrors become JSON responses. */
export function withErrors<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args) => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof HttpError) return jsonError(error.status, error.message)
      if (error instanceof ZodError) {
        return jsonError(400, error.issues[0]?.message ?? "اطلاعات ارسال‌شده معتبر نیست", error.flatten().fieldErrors)
      }
      console.error(error)
      return jsonError(500, "خطای داخلی سرور. لطفاً دوباره تلاش کنید.")
    }
  }
}

export function assertObjectId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "یافت نشد")
}
