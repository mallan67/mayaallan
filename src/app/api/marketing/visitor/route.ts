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
import { sql } from "@/lib/db"
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
  const limit = await rateLimit({
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
    // INSERT first. postgres.js throws on a unique-violation (SQLSTATE 23505)
    // instead of returning an error object — so the "returning visitor" branch
    // lives in the catch. First-touch columns are only ever written on INSERT;
    // the UPDATE path deliberately touches only last_seen_at + the hashes.
    try {
      await sql`
        insert into marketing_visitors
          (visitor_id, first_seen_at, last_seen_at, first_landing_page, first_referrer,
           first_utm_source, first_utm_medium, first_utm_campaign, first_utm_content,
           first_utm_term, user_agent_hash, ip_hash)
        values
          (${visitorId}, ${nowIso}, ${nowIso}, ${firstTouch?.landing_page ?? null},
           ${firstTouch?.referrer ?? null}, ${firstTouch?.utm_source ?? null},
           ${firstTouch?.utm_medium ?? null}, ${firstTouch?.utm_campaign ?? null},
           ${firstTouch?.utm_content ?? null}, ${firstTouch?.utm_term ?? null},
           ${uaHash}, ${ipHash})
      `
    } catch (insertErr) {
      const insertCode = (insertErr as { code?: string })?.code
      const insertMsg = insertErr instanceof Error ? insertErr.message : String(insertErr)
      if (insertCode === "23505") {
        // Returning visitor — update last_seen_at + refresh hashes.
        try {
          await sql`
            update marketing_visitors
            set last_seen_at = ${nowIso},
                user_agent_hash = ${uaHash},
                ip_hash = ${ipHash}
            where visitor_id = ${visitorId}
          `
        } catch (updateErr) {
          const updateCode = (updateErr as { code?: string })?.code
          const updateMsg = updateErr instanceof Error ? updateErr.message : String(updateErr)
          console.error("[marketing-visitor] last_seen update failed:", updateMsg, updateCode)
          await alertAdmin({
            severity: "warning",
            subject: "Marketing attribution: visitor last_seen update failed",
            body: "Returning visitors' last_seen_at can't be refreshed.",
            details: { errorCode: updateCode, errorMessage: updateMsg },
            dedupKey: "marketing:visitor-last-seen-failed",
          })
        }
      } else {
        console.error("[marketing-visitor] insert failed:", insertMsg, insertCode)
        await alertAdmin({
          severity: "warning",
          subject: "Marketing attribution: visitor insert failed",
          body:
            "marketing_visitors insert is failing. Visitor identification continues " +
            "via cookies, but the visitors table won't reflect new arrivals. Check " +
            "the database / schema.",
          details: { errorCode: insertCode, errorMessage: insertMsg },
          dedupKey: "marketing:visitor-upsert-failed",
        })
      }
    }
  } catch (err) {
    console.error("[marketing-visitor] threw:", err instanceof Error ? err.message : String(err))
  }

  return NextResponse.json({ ok: true })
}
