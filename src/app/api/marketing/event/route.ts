/**
 * POST /api/marketing/event
 *
 * Generic browser-side event ingest. Client components (e.g.
 * BookViewTracker, tool engagement components) POST to this endpoint
 * with `{ eventName, properties }`. The route forwards to
 * trackMarketingEvent which reads visitor_id / session_id / touch
 * cookies from the request and inserts the row.
 *
 * Security:
 *   - Same-origin origin check (lenient — allowlist + Vercel previews)
 *   - Per-IP rate limit
 *   - Event name allowlist enforced by trackMarketingEvent itself
 *   - Properties payload bounded by trackMarketingEvent (4 KB cap)
 *
 * Reliability:
 *   - Always returns `{ ok: true }` so the client's fire-and-forget
 *     fetch resolves cleanly; failures only surface in server logs +
 *     alertAdmin
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { trackMarketingEvent, ALLOWED_EVENT_NAMES, type MarketingEventName } from "@/lib/marketing-events"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"

const EventSchema = z.object({
  eventName: z.enum(ALLOWED_EVENT_NAMES as unknown as [MarketingEventName, ...MarketingEventName[]]),
  path: z.string().max(256).optional().nullable(),
  properties: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  // Lenient same-origin gate (analytics doesn't get full CSRF treatment).
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
    return NextResponse.json({ ok: true })
  }

  const ip = getClientIp(request)
  const limit = rateLimit({
    scope: "marketing-event",
    ip,
    windowMs: 60 * 1000,
    maxAttempts: 60, // generous — a single tool session could fire 5-10
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
  const parsed = EventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: true })
  }

  // trackMarketingEvent reads cookies from the request and never throws.
  await trackMarketingEvent({
    request,
    eventName: parsed.data.eventName,
    path: parsed.data.path ?? null,
    properties: parsed.data.properties ?? {},
  })

  return NextResponse.json({ ok: true })
}
