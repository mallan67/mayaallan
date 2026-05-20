import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { deleteAllRuns } from "@/lib/aeo/storage"

// =============================================================================
// POST /api/admin/aeo/clear — wipe all AEO run blobs.
// =============================================================================
// Admin-session-authed. One-off cleanup for when the user wants to start
// fresh (e.g., after a rash of failed runs cluttering the dashboard).
//
// Auto-prune already keeps a rolling window (default last 26 runs) — this
// endpoint is the bigger hammer for a full reset.
// =============================================================================

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  // CSRF: refuse cross-origin POSTs before any session check. sameSite=lax
  // cookies don't block credentialed XHR/fetch from a malicious page.
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const deleted = await deleteAllRuns()
    return NextResponse.json({ deleted })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
