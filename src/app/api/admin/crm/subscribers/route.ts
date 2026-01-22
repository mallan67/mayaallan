import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export async function GET(request: Request) {
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

  const headers = ["email", "source", "created_at"]
  const rows = (subscribers || []).map((s) => [
    s.email,
    s.source || "",
    new Date(s.created_at).toISOString(),
  ])

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  })
}
