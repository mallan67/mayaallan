import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { unsealData } from "iron-session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware running for path:", pathname)

  // Skip login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("mayaallan_admin_session")
    console.log("Admin route accessed, session cookie exists:", !!sessionCookie?.value)

    // Require SESSION_SECRET
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) {
      console.error("SESSION_SECRET environment variable is not set - redirecting to login")
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Verify session exists and is valid
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Decrypt and verify the session
      const session = await unsealData(sessionCookie.value, {
        password: sessionSecret,
      }) as { adminId?: string; isLoggedIn?: boolean }

      // Verify the session has valid authentication
      if (!session.isLoggedIn || !session.adminId) {
        const loginUrl = new URL("/admin/login", request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      // Invalid or expired session
      console.error("Session verification failed:", error)
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
