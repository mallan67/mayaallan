import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllContactSubmissions } from "@/lib/mock-data"

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const contacts = await getAllContactSubmissions()
  
  // Simple pagination
  const start = (page - 1) * limit
  const paginatedContacts = contacts.slice(start, start + limit)
  
  return NextResponse.json({
    data: paginatedContacts,
    total: contacts.length,
    page,
    limit,
  })
}

// Note: updateContact and deleteContact not available in mock-data
// These endpoints return not implemented for now
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
