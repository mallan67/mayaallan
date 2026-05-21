import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Supported i18n locales — keep in sync with src/lib/identity.ts LOCALES.
// Duplicated here because middleware runs at the edge before module resolution
// from /src works reliably; keeping it as a local const avoids edge import
// hazards.
const I18N_LOCALES = ["en", "es", "pt", "de", "fr", "he"] as const
const DEFAULT_I18N_LOCALE = "en"

function detectLocale(pathname: string): string {
  // First URL segment determines locale when it matches a known code; otherwise
  // fall back to the default (English root pages).
  const first = pathname.split("/").filter(Boolean)[0]
  return (I18N_LOCALES as readonly string[]).includes(first || "") ? (first as string) : DEFAULT_I18N_LOCALE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add pathname + locale headers for server components (layouts especially) to
  // read without re-parsing the URL themselves.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)
  requestHeaders.set("x-locale", detectLocale(pathname))

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
    // Bcrypt-hashed credential is required; the legacy plaintext
    // ADMIN_PASSWORD path was removed (Vercel env vars are visible to
    // anyone with project read access — plaintext storage there was a
    // credential leak waiting to happen).
    const hasAdminCredential = !!process.env.ADMIN_PASSWORD_HASH

    // EMERGENCY BLOCK: If environment variables are missing, redirect to login
    // (AdminAuthGuard will show the error message)
    if (!hasSessionSecret || !hasAdminEmail || !hasAdminCredential) {
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

// Matcher now covers all routes except static assets and Next internals, so
// the x-pathname + x-locale headers are populated everywhere. Admin gating
// still keys off the pathname check inside the function — same behavior as
// before for /admin/*.
export const config = {
  matcher: [
    // Match all paths except: _next internals, static files (anything with a
    // dot), Next image optimizer, and favicon. This is the standard Next.js
    // i18n middleware matcher recipe.
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    // Belt-and-braces: explicitly include every /admin/* path regardless of
    // whether it contains a dot. The recipe above excludes dotted paths to
    // avoid running middleware on static assets, but the day someone adds an
    // admin route like /admin/export.csv we want the auth gate to still run.
    // The auth check inside the middleware function is the load-bearing line;
    // this matcher entry just guarantees it runs.
    "/admin/:path*",
  ],
}
