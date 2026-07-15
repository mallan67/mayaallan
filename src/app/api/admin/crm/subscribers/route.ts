import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { sql } from "@/lib/db"
import { buildCsv } from "@/lib/csv"

export async function GET(request: Request) {
  // Same-origin guard for parity with the analytics CSV export — this is a
  // PII attachment (subscriber emails), so don't serve it cross-origin.
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let subscribers
  try {
    subscribers = await sql`
      select * from email_subscribers
      order by created_at desc
    `
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }

  const rows = subscribers.map((s: any) => [
    s.email,
    s.source || "",
    s.created_at ? new Date(s.created_at).toISOString() : "",
  ])

  // RFC 4180 quoting + formula-safe leading-char prefix for the email
  // and source columns (attacker-controllable).
  const csv = buildCsv(["email", "source", "created_at"], rows, { formulaSafe: true })

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
      "Cache-Control": "private, no-store",
    },
  })
}
