import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Protect admin routes - always require login
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("mayaallan_admin_session")

    // No valid session - redirect to login
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Simple check: if cookie exists but SESSION_SECRET not set, reject
    if (!process.env.SESSION_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
