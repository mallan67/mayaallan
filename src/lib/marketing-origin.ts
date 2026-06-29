/**
 * Origin allowlist for public marketing endpoints (visitor + event).
 *
 * Production:  only https://www.mayaallan.com and https://mayaallan.com.
 *              Random *.vercel.app sites must NOT be able to write into
 *              production analytics — that would let anyone with a Vercel
 *              deployment pollute the dataset.
 *
 * Preview/dev: production origins PLUS *.vercel.app (so PR previews work)
 *              PLUS localhost variants.
 *
 * Different from admin-request-guard:
 *   - The admin guard rejects with 403 on mismatch.
 *   - The marketing endpoints return { ok: true } with no DB write on
 *     mismatch so a misconfigured client never sees a hard failure.
 *
 * Caller pattern:
 *   if (!isAllowedMarketingOrigin(request)) return NextResponse.json({ ok: true })
 */

import { NextResponse } from "next/server"

const PROD_ORIGINS = new Set<string>([
  "https://www.mayaallan.com",
  "https://mayaallan.com",
])

const DEV_ORIGINS = new Set<string>([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
])

function getRuntimeMode(): "production" | "preview" | "development" {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === "production") return "production"
  if (vercelEnv === "preview") return "preview"
  if (process.env.NODE_ENV === "production") return "production"
  return "development"
}

export function isAllowedMarketingOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin") || ""

  // No Origin header at all (e.g. some same-origin keepalive fetches in
  // older browsers) — accept. Worst case a stray request slips through;
  // CSRF here is low-stakes vs the admin routes.
  if (!originHeader) return true

  let host: string
  try {
    const u = new URL(originHeader)
    host = u.host
  } catch {
    return false
  }

  const mode = getRuntimeMode()

  if (mode === "production") {
    return PROD_ORIGINS.has(originHeader)
  }

  // preview / development
  if (PROD_ORIGINS.has(originHeader)) return true
  if (DEV_ORIGINS.has(originHeader)) return true
  if (host.endsWith(".vercel.app")) return true
  return false
}

/**
 * Hard-fail same-origin guard for public *action* routes (session export,
 * PDF tool, popup-flow PayPal capture).
 *
 * Difference from `isAllowedMarketingOrigin`:
 *   - Marketing endpoints fail SOFT (silently no-op) because a dropped
 *     analytics beacon is harmless.
 *   - Action routes that send email, render PDFs, or move money should fail
 *     HARD with a 403 when the request originates from a disallowed site —
 *     this is the CSRF gate (a victim's browser tricked into POSTing from a
 *     malicious page sends that page's Origin, and we reject it).
 *
 * Note on scope: the Origin header is browser-enforced and cannot be set by
 * page JS, so this blocks cross-site browser attacks. It does NOT stop a
 * non-browser attacker (curl can forge or omit Origin) — rate limiting is
 * the control for that, and these routes pair this guard with one.
 *
 * Missing Origin is allowed (some legitimate same-origin fetches omit it),
 * consistent with the marketing helper; the paired rate limit remains the
 * backstop for header-less abuse.
 *
 * Returns `{ ok: true }` (continue) or `{ ok: false, response }` (return it).
 */
export function assertPublicSameOrigin(
  request: Request,
): { ok: true } | { ok: false; response: NextResponse } {
  if (isAllowedMarketingOrigin(request)) return { ok: true }
  return {
    ok: false,
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  }
}
