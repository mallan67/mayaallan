import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAllContactSubmissions } from "@/lib/mock-data"

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const submissions = await getAllContactSubmissions()
  return NextResponse.json(submissions)
}
