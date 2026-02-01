import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add pathname header for server components to read
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // Skip login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // Protect admin routes - always require login
  if (pathname.startsWith("/admin")) {
    // CRITICAL: If admin auth is not configured, BLOCK ALL ACCESS
    const hasSessionSecret = !!process.env.SESSION_SECRET
    const hasAdminEmail = !!process.env.ADMIN_EMAIL
    const hasAdminPassword = !!process.env.ADMIN_PASSWORD

    // EMERGENCY BLOCK: If environment variables are missing, redirect to login
    // (AdminAuthGuard will show the error message)
    if (!hasSessionSecret || !hasAdminEmail || !hasAdminPassword) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const sessionCookie = request.cookies.get("mayaallan_admin_session")

    // No valid session - redirect to login
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/admin/:path*"],
}
