import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next()

  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next()

  const hasSession = req.cookies.get("mayaallan_admin_session")?.value
  if (hasSession) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = "/admin/login"
  return NextResponse.redirect(url)
}

export const config = { matcher: ["/admin/:path*"] }
