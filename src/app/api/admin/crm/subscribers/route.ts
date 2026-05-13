import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { buildCsv } from "@/lib/csv"

export async function GET(_request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: subscribers, error } = await supabaseAdmin
    .from(Tables.emailSubscribers)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }

  const rows = (subscribers || []).map((s: any) => [
    s.email,
    s.source || "",
    s.created_at ? new Date(s.created_at).toISOString() : "",
  ])

  // RFC 4180 — quotes any value containing commas / quotes / newlines.
  const csv = buildCsv(["email", "source", "created_at"], rows)

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
      "Cache-Control": "private, no-store",
    },
  })
}
