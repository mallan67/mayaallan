import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getEmailSubscribers } from "@/lib/mock-data"

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const subscribers = await getEmailSubscribers()

  const headers = ["email", "status"]
  const rows = subscribers.map((s) => [
    s.email,
    (s as any).status || "active",
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
