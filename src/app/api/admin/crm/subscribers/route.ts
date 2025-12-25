import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAllEmailSubscribers } from "@/lib/mock-data"

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const subscribers = await getAllEmailSubscribers()
  return NextResponse.json(subscribers)
}

export async function POST() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Export CSV
  const subscribers = await getAllEmailSubscribers()
  const csv = [["Email", "Source", "Created At"], ...subscribers.map((s) => [s.email, s.source || "", s.createdAt])]
    .map((row) => row.join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  })
}
