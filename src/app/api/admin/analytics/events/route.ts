/**
 * GET /api/admin/analytics/events
 *
 * Admin-only CSV export of the marketing_events stream. Supports filters:
 *   ?from=2026-04-01T00:00:00Z   (ISO timestamp, OR "7d" / "30d" / "90d")
 *   ?to=2026-05-13T00:00:00Z     (ISO timestamp)
 *   ?event=checkout_started       (event_name exact match)
 *
 * Rows are streamed conceptually but buffered in-memory — 100k events
 * is ~5 MB of CSV which is fine. If we ever hit volume that strains
 * memory we can switch to a real streaming response.
 *
 * CSV escaping uses src/lib/csv.ts which is RFC 4180 compliant.
 */
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { buildCsv } from "@/lib/csv"

export const runtime = "nodejs"

function resolveFromParam(raw: string | null): string {
  if (!raw) return isoDaysAgo(30)
  const trimmed = raw.trim()
  // Shorthand: "7d", "30d", "90d"
  const m = trimmed.match(/^(\d{1,4})d$/i)
  if (m) {
    const days = Number(m[1])
    if (Number.isFinite(days) && days > 0 && days <= 3650) {
      return isoDaysAgo(days)
    }
  }
  // Try parsing as ISO timestamp
  const t = new Date(trimmed)
  if (!isNaN(t.getTime())) return t.toISOString()
  return isoDaysAgo(30)
}

function resolveToParam(raw: string | null): string {
  if (!raw) return new Date().toISOString()
  const t = new Date(raw.trim())
  if (!isNaN(t.getTime())) return t.toISOString()
  return new Date().toISOString()
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const fromIso = resolveFromParam(url.searchParams.get("from"))
  const toIso = resolveToParam(url.searchParams.get("to"))
  const eventFilter = url.searchParams.get("event")?.trim() || null

  try {
    let query = supabaseAdmin
      .from("marketing_events")
      .select("created_at, event_name, path, visitor_id, session_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, properties")
      .gte("created_at", fromIso)
      .lte("created_at", toIso)
      .order("created_at", { ascending: false })
      .limit(100_000)

    if (eventFilter) {
      query = query.eq("event_name", eventFilter)
    }

    const { data, error } = await query
    if (error) {
      console.error("[analytics/events] supabase error:", error.message, error.code)
      return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }

    const rows = (data ?? []).map((r: any) => [
      r.created_at,
      r.event_name,
      r.path,
      r.visitor_id,
      r.session_id,
      r.utm_source,
      r.utm_medium,
      r.utm_campaign,
      r.utm_content,
      r.utm_term,
      r.properties,
    ])

    const csv = buildCsv(
      [
        "created_at",
        "event_name",
        "path",
        "visitor_id",
        "session_id",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "properties",
      ],
      rows,
    )

    const filename = `marketing-events-${fromIso.slice(0, 10)}-to-${toIso.slice(0, 10)}${eventFilter ? `-${eventFilter}` : ""}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err) {
    console.error("[analytics/events] threw:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
