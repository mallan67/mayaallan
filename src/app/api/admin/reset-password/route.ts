import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { resetPasswordWithToken } from "@/lib/admin-credentials"
import { alertAdmin } from "@/lib/alert-admin"

// =============================================================================
// POST /api/admin/reset-password
// =============================================================================
// Body: { token, password }
//
// Validates the one-time reset token (from the emailed link), then sets a new
// bcrypt-hashed admin password in the DB and clears the token. After this, the
// new password works at /admin/login immediately (no redeploy).
// =============================================================================

export const runtime = "nodejs"

const Body = z.object({
  token: z.string().min(1),
  // Minimum length only; complexity is the operator's call. Cap to a sane max.
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
})

export async function POST(req: Request) {
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  const ip = getClientIp(req)
  // Throttle token-guessing. Tokens are 256-bit random so brute force is
  // infeasible, but a coarse cap is cheap defense-in-depth.
  const limit = await rateLimit({
    scope: "admin-reset-password",
    ip,
    windowMs: 15 * 60 * 1000,
    maxAttempts: 10,
    lockoutMs: 30 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    const msg = parsed.error?.issues?.[0]?.message ?? "Invalid input"
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }

  let result: Awaited<ReturnType<typeof resetPasswordWithToken>>
  try {
    result = await resetPasswordWithToken(parsed.data.token, parsed.data.password)
  } catch (err) {
    console.error("[reset-password] failed:", err)
    await alertAdmin({
      severity: "error",
      subject: "Admin password reset: write failed",
      body:
        "A valid reset token was presented but writing the new password to " +
        "admin_auth failed. Check that the 2026-06-29-admin-auth migration has " +
        "been run in Supabase.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "auth:reset-write-failed",
    })
    return NextResponse.json({ ok: false, error: "Could not reset password" }, { status: 500 })
  }

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
