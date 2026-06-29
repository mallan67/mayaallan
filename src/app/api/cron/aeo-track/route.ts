import { NextRequest, NextResponse } from "next/server"
import { executeRun } from "@/lib/aeo/runner"
import { safeCompare } from "@/lib/safe-compare"

// =============================================================================
// /api/cron/aeo-track — weekly AEO probe (Vercel Cron entry point).
// =============================================================================
// Auth via CRON_SECRET (Vercel Cron sends Authorization: Bearer <secret>).
// All probe + storage logic lives in src/lib/aeo/runner.ts — this route is
// just the cron-authed wrapper. The admin "Run now" button uses the same
// runner via a session-authed endpoint.
//
// MANUAL TRIGGER (terminal):
//   curl -X POST https://www.mayaallan.com/api/cron/aeo-track \
//     -H "Authorization: Bearer $CRON_SECRET"
//
// MANUAL TRIGGER (no terminal): just click "Run now" in /admin/aeo.
// =============================================================================

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  return run(req)
}

// Vercel Cron defaults to GET — accept both so manual + scheduled work.
export async function GET(req: NextRequest) {
  return run(req)
}

async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!secret || !auth || !safeCompare(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await executeRun()
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json(result.summary)
}
