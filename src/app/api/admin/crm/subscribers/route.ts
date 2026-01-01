import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const subscribers = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  })

  const headers = ["email", "source", "created_at"]
  const rows = subscribers.map((s) => [
    s.email,
    s.source || "",
    s.createdAt.toISOString(),
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
