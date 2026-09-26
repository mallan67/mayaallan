import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { isSearchConsoleConfigured } from "@/lib/search-console/client"
import { collectAndSaveSearchConsoleSnapshot } from "@/lib/search-console/snapshot"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isSearchConsoleConfigured()) {
    return NextResponse.json(
      { error: "Search Console API is not configured in the production environment." },
      { status: 503 },
    )
  }

  try {
    const snapshot = await collectAndSaveSearchConsoleSnapshot()
    return NextResponse.json({
      ok: true,
      fetchedAt: snapshot.fetchedAt,
      opportunities: snapshot.opportunities.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
