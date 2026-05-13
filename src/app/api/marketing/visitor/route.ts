/**
 * POST /api/marketing/visitor
 *
 * Called once per visitor (by MarketingAttributionClient on the first
 * page-load that doesn't already have an `ma_visitor_id` cookie). The
 * client passes its newly-minted visitor_id + the first-touch data so
 * we can upsert a row into marketing_visitors.
 *
 * Privacy: stores HASHED ip + user-agent (sha256 truncated). The raw
 * values never touch the database.
 *
 * Reliability: tracking failures MUST NOT surface to the user. Every
 * error path returns 200 OK with `{ ok: true }` so the keepalive fetch
 * resolves cleanly. Real failures are logged + alerted (dedup'd) so
 * Maya can see if the visitor stream stops.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { alertAdmin } from "@/lib/alert-admin"
import { hashForAttribution } from "@/lib/marketing-events"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"

const VisitorSchema = z.object({
  visitorId: z.string().min(8).max(128),
  firstTouch: z
    .object({
      landing_page: z.string().max(256).optional(),
      referrer: z.string().max(256).optional(),
      utm_source: z.string().max(128).optional(),
      utm_medium: z.string().max(128).optional(),
      utm_campaign: z.string().max(128).optional(),
      utm_content: z.string().max(128).optional(),
      utm_term: z.string().max(128).optional(),
    })
    .partial()
    .optional(),
})

export async function POST(request: Request) {
  // Same-origin protection: stop random external scripts from spamming
  // the visitor table. This is best-effort — analytics endpoints don't
  // need to be as strict as money paths.
  const origin = request.headers.get("origin") || ""
  const allowedOrigins = [
    "https://www.mayaallan.com",
    "https://mayaallan.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]
  const isPreviewOrigin = (() => {
    try {
      const u = new URL(origin)
      return u.hostname.endsWith(".vercel.app")
    } catch {
      return false
    }
  })()
  if (origin && !allowedOrigins.includes(origin) && !isPreviewOrigin) {
    // Return 200 to avoid revealing the origin check to crawlers; do nothing.
    return NextResponse.json({ ok: true })
  }

  const ip = getClientIp(request)
  const limit = rateLimit({
    scope: "marketing-visitor",
    ip,
    windowMs: 60 * 1000,
    maxAttempts: 30,
    lockoutMs: 5 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json({ ok: true })
  }

  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }
  const parsed = VisitorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: true })
  }
  const { visitorId, firstTouch } = parsed.data

  try {
    const ipHash = hashForAttribution(ip)
    const uaHash = hashForAttribution(request.headers.get("user-agent"))

    // ON CONFLICT (visitor_id) DO UPDATE — refresh last_seen_at; never
    // clobber the first-touch fields once they're set.
    const { error } = await supabaseAdmin
      .from("marketing_visitors")
      .upsert(
        {
          visitor_id: visitorId,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          first_landing_page: firstTouch?.landing_page ?? null,
          first_referrer: firstTouch?.referrer ?? null,
          first_utm_source: firstTouch?.utm_source ?? null,
          first_utm_medium: firstTouch?.utm_medium ?? null,
          first_utm_campaign: firstTouch?.utm_campaign ?? null,
          first_utm_content: firstTouch?.utm_content ?? null,
          first_utm_term: firstTouch?.utm_term ?? null,
          user_agent_hash: uaHash,
          ip_hash: ipHash,
        },
        { onConflict: "visitor_id", ignoreDuplicates: true },
      )

    if (error) {
      console.error("[marketing-visitor] upsert failed:", error.message, error.code)
      await alertAdmin({
        severity: "warning",
        subject: "Marketing attribution: visitor upsert failed",
        body:
          "marketing_visitors upsert is failing. Visitor identification continues " +
          "via cookies, but the visitors table won't reflect new arrivals. Check " +
          "supabase / schema.",
        details: { errorCode: error.code, errorMessage: error.message },
        dedupKey: "marketing:visitor-upsert-failed",
      })
    }
  } catch (err) {
    console.error("[marketing-visitor] threw:", err instanceof Error ? err.message : String(err))
  }

  return NextResponse.json({ ok: true })
}
