import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllEmailSubscribers } from "@/lib/mock-data"

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const format = searchParams.get("format")

  const subscribers = await getAllEmailSubscribers()

  if (format === "csv") {
    // Generate CSV export
    const headers = ["email", "subscribedAt", "status"]
    const rows = subscribers.map(s => [
      s.email,
      s.subscribedAt || "",
      s.status || "active"
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=subscribers.csv",
      },
    })
  }

  // Simple pagination
  const start = (page - 1) * limit
  const paginatedSubscribers = subscribers.slice(start, start + limit)
  
  return NextResponse.json({
    data: paginatedSubscribers,
    total: subscribers.length,
    page,
    limit,
  })
}

// Note: updateSubscriber and deleteSubscriber not available in mock-data
export async function PATCH() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ error: "Not implemented" }, { status: 501 })
}

export async function DELETE() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ error: "Not implemented" }, { status: 501 })
}
