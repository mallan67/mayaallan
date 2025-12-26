import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get("mayaallan_admin_session")

  // If no session and trying to access admin, redirect to login
  if (pathname.startsWith("/admin") && !sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
