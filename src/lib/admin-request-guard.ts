/**
 * Same-origin / CSRF guard for admin mutating routes.
 *
 * Why this exists alongside session checks:
 *   The admin session cookie uses iron-session with sameSite: "lax".
 *   Lax blocks cross-site form POSTs but not top-level GET navigations,
 *   and it does NOT block JSON XHR/fetch from a malicious page if that
 *   page can somehow trigger the request with credentials. The Origin
 *   header is the browser-enforced source-of-truth for "where did this
 *   request come from" on credentialed requests.
 *
 *   This guard is ADDITIVE — every admin route still runs its existing
 *   `isAuthenticated()` / session check. CSRF + session both have to
 *   pass for a mutation to land.
 *
 * Apply to: every src/app/api/admin/** handler that mutates state
 *   (POST / PUT / PATCH / DELETE). Read-only GET handlers don't need it
 *   because reading without a side effect can't change anything.
 *
 * Do NOT apply to public endpoints: contact, subscribe, checkout,
 *   PayPal webhook (verified by signature, no cookies), download
 *   (token-gated, no cookies).
 */
import { NextResponse } from "next/server"

const PROD_ORIGINS = [
  "https://www.mayaallan.com",
  // mayaallan.com (apex) is normally redirected to www at the edge, but
  // some clients send the original Origin header before following the
  // redirect. Allowing both prevents legitimate admin actions from
  // bouncing when initiated against the apex.
  "https://mayaallan.com",
] as const

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
] as const

function isVercelPreviewOrigin(originHost: string): boolean {
  // Vercel preview deployments have URLs of the form
  //   <project>-<hash>-<scope>.vercel.app
  // We never want to allow vercel.app in PRODUCTION (that would let any
  // preview deploy of any project on Vercel POST to our prod admin
  // routes). Caller gates this behind a preview/dev check.
  return originHost.endsWith(".vercel.app")
}

function getRuntimeMode(): "production" | "preview" | "development" {
  // VERCEL_ENV is set on Vercel to "production" | "preview" | "development".
  // NODE_ENV is the build-time fallback for non-Vercel environments.
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === "production") return "production"
  if (vercelEnv === "preview") return "preview"
  if (process.env.NODE_ENV === "production") return "production"
  return "development"
}

function parseOriginHost(value: string | null): { origin: string; host: string } | null {
  if (!value) return null
  try {
    const u = new URL(value)
    return { origin: `${u.protocol}//${u.host}`, host: u.host }
  } catch {
    return null
  }
}

function isAllowedOrigin(origin: string, host: string): boolean {
  const mode = getRuntimeMode()

  if (mode === "production") {
    return (PROD_ORIGINS as readonly string[]).includes(origin)
  }

  if (mode === "preview") {
    if ((PROD_ORIGINS as readonly string[]).includes(origin)) return true
    if (isVercelPreviewOrigin(host)) return true
    return false
  }

  // development
  if ((DEV_ORIGINS as readonly string[]).includes(origin)) return true
  if ((PROD_ORIGINS as readonly string[]).includes(origin)) return true
  return false
}

/**
 * Verify the request came from an allowed admin origin.
 *
 *   - Checks the `Origin` header first.
 *   - Falls back to `Referer` (some browsers omit Origin on same-origin
 *     navigation-like requests).
 *   - Rejects with a generic 403 if neither matches.
 *
 * Returns either `{ ok: true }` (caller continues) or
 *   `{ ok: false, response }` (caller should return that response).
 */
export function assertAdminSameOrigin(
  request: Request,
): { ok: true } | { ok: false; response: NextResponse } {
  const originHeader = request.headers.get("origin")
  const refererHeader = request.headers.get("referer")

  const parsed = parseOriginHost(originHeader) ?? parseOriginHost(refererHeader)

  if (!parsed) {
    // No Origin / no parseable Referer. Browsers always send one of
    // these on credentialed mutating requests, so absence is suspect.
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  if (!isAllowedOrigin(parsed.origin, parsed.host)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { ok: true }
}
