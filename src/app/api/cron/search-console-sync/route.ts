import { NextRequest, NextResponse } from "next/server"
import { safeCompare } from "@/lib/safe-compare"
import { isSearchConsoleConfigured } from "@/lib/search-console/client"
import { collectAndSaveSearchConsoleSnapshot } from "@/lib/search-console/snapshot"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!secret || !auth || !safeCompare(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isSearchConsoleConfigured()) {
    return NextResponse.json({ skipped: true, reason: "Search Console API not configured" })
  }

  try {
    const snapshot = await collectAndSaveSearchConsoleSnapshot()
    return NextResponse.json({
      ok: true,
      fetchedAt: snapshot.fetchedAt,
      opportunities: snapshot.opportunities.length,
      pages: snapshot.pages.length,
      inspections: snapshot.inspections.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
