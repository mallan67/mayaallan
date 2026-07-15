import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  // Clamp pagination: a NaN page → 500 (range(NaN,NaN)); an unbounded limit
  // (?limit=1000000) loads ~1M rows. Bound both.
  const pageRaw = parseInt(searchParams.get("page") || "1", 10)
  const limitRaw = parseInt(searchParams.get("limit") || "20", 10)
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20
  const offset = (page - 1) * limit

  // range(offset, offset+limit-1) is inclusive → offset N, limit `limit`.
  // allSettled preserves original semantics: a contacts-query failure is a
  // 500, but a count-query failure is ignored (total falls back to 0).
  const [contactsResult, countResult] = await Promise.allSettled([
    sql`
      select * from contact_submissions
      order by created_at desc
      offset ${offset} limit ${limit}
    `,
    sql`select count(*)::int as count from contact_submissions`,
  ])

  if (contactsResult.status === "rejected") {
    console.error("Error fetching contacts:", contactsResult.reason)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }

  return NextResponse.json({
    data: contactsResult.value,
    total: countResult.status === "fulfilled" ? (countResult.value[0]?.count ?? 0) : 0,
    page,
    limit,
  })
}

export async function PATCH() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ error: "Not implemented" }, { status: 501 })
}

export async function DELETE(request: Request) {
  // CSRF: a cross-origin DELETE here would delete contact submissions while
  // an admin is logged in. Same-origin guard runs before any state change.
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    await sql`delete from contact_submissions where id = ${parseInt(id)}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete contact error:", error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
