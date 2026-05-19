import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { executeRun } from "@/lib/aeo/runner"

// =============================================================================
// POST /api/admin/aeo/run-now — admin button trigger for an AEO probe.
// =============================================================================
// Same runner as the weekly cron, but authenticated by admin session instead
// of CRON_SECRET so the dashboard can trigger it from a browser click with no
// terminal / curl required.
//
// Long-running: full probe takes 30 sec to 3 min depending on engine count
// and how fast each provider responds.
// =============================================================================

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function POST() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await executeRun()
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json(result.summary)
}
