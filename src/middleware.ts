import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, dashboardPath, verifySession } from "@/lib/session-token"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)

  // Logged-in users don't need the login / register pages.
  if (pathname.startsWith("/auth/")) {
    return session ? NextResponse.redirect(new URL(dashboardPath(session.role), req.url)) : NextResponse.next()
  }

  const area = pathname.startsWith("/doctor") ? "doctor" : "patient"
  if (!session) {
    const login = new URL(`/auth/${area}/login`, req.url)
    login.searchParams.set("next", pathname)
    return NextResponse.redirect(login)
  }
  if (session.role !== area) {
    return NextResponse.redirect(new URL(dashboardPath(session.role), req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/auth/:path*"],
}
