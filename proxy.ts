import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { identifyCrawler } from "@/lib/crawler-identify"

// Supported i18n locales — keep in sync with src/lib/identity.ts LOCALES.
const I18N_LOCALES = ["en", "es", "pt", "de", "fr", "he"] as const
const DEFAULT_I18N_LOCALE = "en"

function detectLocale(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0]
  return (I18N_LOCALES as readonly string[]).includes(first || "") ? (first as string) : DEFAULT_I18N_LOCALE
}

function scheduleCrawlerTelemetry(request: NextRequest, event: NextFetchEvent) {
  const secret = process.env.CRAWLER_TELEMETRY_SECRET
  if (!secret) return
  if (request.method !== "GET" && request.method !== "HEAD") return

  const pathname = request.nextUrl.pathname
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) return

  const userAgent = request.headers.get("user-agent")
  const crawler = identifyCrawler(userAgent)
  if (!crawler) return

  const endpoint = new URL("/api/crawler-event", request.url)
  event.waitUntil(
    fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-crawler-telemetry-secret": secret,
      },
      body: JSON.stringify({
        crawler: crawler.name,
        kind: crawler.kind,
        path: pathname,
        method: request.method,
        userAgent: userAgent?.slice(0, 512) ?? undefined,
      }),
      cache: "no-store",
    }).catch(() => undefined),
  )
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // Fire-and-forget crawler measurement. Rendering/auth never depends on it.
  scheduleCrawlerTelemetry(request, event)

  // Add pathname + locale headers for server components.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)
  requestHeaders.set("x-locale", detectLocale(pathname))

  const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"]
  if (PUBLIC_ADMIN_PATHS.includes(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (pathname.startsWith("/admin")) {
    const hasSessionSecret = !!process.env.SESSION_SECRET
    const hasAdminEmail = !!process.env.ADMIN_EMAIL

    if (!hasSessionSecret || !hasAdminEmail) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const sessionCookie = request.cookies.get("mayaallan_admin_session")
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/admin/:path*",
    "/robots.txt",
    "/sitemap.xml",
  ],
}
