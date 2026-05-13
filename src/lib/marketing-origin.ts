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
