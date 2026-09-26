import { NextResponse } from "next/server"
import { z } from "zod"
import { safeCompare } from "@/lib/safe-compare"
import { trackMarketingEvent } from "@/lib/marketing-events"

export const runtime = "nodejs"

const Body = z.object({
  crawler: z.string().min(1).max(64),
  kind: z.string().min(1).max(64),
  path: z.string().min(1).max(256),
  method: z.string().min(1).max(12),
  userAgent: z.string().max(512).optional(),
})

export async function POST(request: Request) {
  const secret = process.env.CRAWLER_TELEMETRY_SECRET
  const provided = request.headers.get("x-crawler-telemetry-secret")
  if (!secret || !provided || !safeCompare(provided, secret)) {
    return new NextResponse(null, { status: 204 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const parsed = Body.safeParse(body)
  if (!parsed.success) return new NextResponse(null, { status: 204 })

  await trackMarketingEvent({
    eventName: "crawler_visit",
    path: parsed.data.path,
    properties: {
      crawler: parsed.data.crawler,
      kind: parsed.data.kind,
      method: parsed.data.method,
      // Crawler UAs identify software, not a natural person. Keep it bounded
      // anyway so telemetry cannot become a general request-log sink.
      user_agent: parsed.data.userAgent?.slice(0, 512) ?? null,
    },
  })

  return new NextResponse(null, { status: 204 })
}
