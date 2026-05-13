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
import { isAllowedMarketingOrigin } from "@/lib/marketing-origin"

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
  // Production: only mayaallan.com origins write. Preview/dev: + *.vercel.app
  // + localhost. Mismatch returns { ok: true } silently so the client's
  // keepalive fetch resolves cleanly.
  if (!isAllowedMarketingOrigin(request)) {
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
    const nowIso = new Date().toISOString()

    // Two-step upsert so we can preserve first_* fields on conflict while
    // still refreshing last_seen_at + the latest hashed IP/UA.
    //
    // INSERT first. If it succeeds the row is brand new and we're done.
    // If it returns a unique-violation (23505) the visitor already exists;
    // we follow up with an UPDATE that touches ONLY last_seen_at + hashes
    // — never first_* fields.
    const { error: insertError } = await supabaseAdmin
      .from("marketing_visitors")
      .insert({
        visitor_id: visitorId,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        first_landing_page: firstTouch?.landing_page ?? null,
        first_referrer: firstTouch?.referrer ?? null,
        first_utm_source: firstTouch?.utm_source ?? null,
        first_utm_medium: firstTouch?.utm_medium ?? null,
        first_utm_campaign: firstTouch?.utm_campaign ?? null,
        first_utm_content: firstTouch?.utm_content ?? null,
        first_utm_term: firstTouch?.utm_term ?? null,
        user_agent_hash: uaHash,
        ip_hash: ipHash,
      })

    if (insertError && insertError.code === "23505") {
      // Returning visitor — update last_seen_at + refresh hashes. First-touch
      // columns are deliberately omitted so they remain immutable.
      const { error: updateError } = await supabaseAdmin
        .from("marketing_visitors")
        .update({
          last_seen_at: nowIso,
          user_agent_hash: uaHash,
          ip_hash: ipHash,
        })
        .eq("visitor_id", visitorId)

      if (updateError) {
        console.error("[marketing-visitor] last_seen update failed:", updateError.message, updateError.code)
        await alertAdmin({
          severity: "warning",
          subject: "Marketing attribution: visitor last_seen update failed",
          body: "Returning visitors' last_seen_at can't be refreshed.",
          details: { errorCode: updateError.code, errorMessage: updateError.message },
          dedupKey: "marketing:visitor-last-seen-failed",
        })
      }
    } else if (insertError) {
      console.error("[marketing-visitor] insert failed:", insertError.message, insertError.code)
      await alertAdmin({
        severity: "warning",
        subject: "Marketing attribution: visitor insert failed",
        body:
          "marketing_visitors insert is failing. Visitor identification continues " +
          "via cookies, but the visitors table won't reflect new arrivals. Check " +
          "supabase / schema.",
        details: { errorCode: insertError.code, errorMessage: insertError.message },
        dedupKey: "marketing:visitor-upsert-failed",
      })
    }
  } catch (err) {
    console.error("[marketing-visitor] threw:", err instanceof Error ? err.message : String(err))
  }

  return NextResponse.json({ ok: true })
}
