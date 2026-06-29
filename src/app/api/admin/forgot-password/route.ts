import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { createResetToken } from "@/lib/admin-credentials"
import { alertAdmin } from "@/lib/alert-admin"

// =============================================================================
// POST /api/admin/forgot-password
// =============================================================================
// Body: { email }
//
// If `email` matches ADMIN_EMAIL, mints a one-time reset token and emails a
// reset link to ADMIN_EMAIL (NEVER to the submitted address — that prevents
// an attacker from redirecting the reset link to their own inbox). Always
// returns a generic { ok: true } so the endpoint never reveals whether the
// submitted address is the admin's.
// =============================================================================

export const runtime = "nodejs"

const Body = z.object({ email: z.string().email() })

// Generic response — identical whether or not the email matched. Don't leak
// admin-account existence.
const GENERIC_OK = NextResponse.json({ ok: true })

export async function POST(req: Request) {
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  const ip = getClientIp(req)
  // Throttle to stop inbox spam / token churn. The email only ever goes to the
  // admin address, so this isn't an arbitrary-recipient bomb — but still cap it.
  const limit = await rateLimit({
    scope: "admin-forgot-password",
    ip,
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    lockoutMs: 30 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    // Even on bad input, keep the response generic so timing/shape doesn't leak.
    return GENERIC_OK
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const resendKey = process.env.RESEND_API_KEY

  // Only proceed for the real admin address. Comparison is a plain equality on
  // a non-secret value (the admin email is public), so constant-time isn't
  // needed here.
  if (!adminEmail || parsed.data.email !== adminEmail) {
    return GENERIC_OK
  }

  if (!resendKey) {
    console.error("[forgot-password] RESEND_API_KEY not set — cannot send reset email")
    await alertAdmin({
      severity: "critical",
      subject: "Admin password reset requested but RESEND_API_KEY missing",
      body: "A reset link was requested but email can't be sent. Set RESEND_API_KEY.",
      dedupKey: "auth:forgot-no-resend",
    })
    return GENERIC_OK
  }

  let rawToken: string
  try {
    rawToken = await createResetToken()
  } catch (err) {
    console.error("[forgot-password] token creation failed:", err)
    await alertAdmin({
      severity: "error",
      subject: "Admin password reset: token creation failed",
      body:
        "Could not write a reset token to admin_auth. The most likely cause is " +
        "the admin_auth table not existing yet — run the 2026-06-29-admin-auth " +
        "migration in Supabase.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "auth:forgot-token-failed",
    })
    return GENERIC_OK
  }

  // Build an absolute reset link from the request origin (so it works on prod,
  // preview, and local without a hardcoded host).
  const origin = new URL(req.url).origin
  const resetUrl = `${origin}/admin/reset-password?token=${encodeURIComponent(rawToken)}`

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; color: #14110d; line-height: 1.6;">
      <h2 style="font-size: 20px; font-weight: 600;">Reset your admin password</h2>
      <p>Someone requested a password reset for the mayaallan.com admin panel.
      If that was you, click the button below. This link expires in 10 minutes
      and can only be used once.</p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}"
           style="background:#14110d;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
          Set a new password
        </a>
      </p>
      <p style="font-size: 13px; color: #6B665E;">If the button doesn't work, paste this URL into your browser:<br>
        <span style="word-break: break-all;">${resetUrl}</span></p>
      <p style="font-size: 13px; color: #6B665E;">If you didn't request this, you can ignore this email — your password
      won't change unless you open the link and set a new one.</p>
    </div>
  `

  try {
    const resend = new Resend(resendKey)
    const { error } = await resend.emails.send({
      from: "Maya Allan Admin <alerts@mayaallan.com>",
      to: adminEmail,
      subject: "Reset your mayaallan.com admin password",
      html,
    })
    if (error) {
      console.error("[forgot-password] Resend rejected the email:", error)
    }
  } catch (err) {
    console.error("[forgot-password] send threw:", err)
  }

  return GENERIC_OK
}
