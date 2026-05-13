/**
 * POST /api/admin/test-alert
 *
 * Sends a test email through alertAdmin() so we can verify the end-to-end
 * alert pipeline (Resend domain → ADMIN_EMAIL inbox) without touching PayPal,
 * customers, or live order data.
 *
 * Security:
 *   - Requires authenticated admin session (iron-session cookie).
 *   - Returns 401 to unauthenticated callers.
 *   - Does NOT echo secrets, env vars, or upstream error text in the response.
 *   - Uses a unique dedup key per request so test mails always send.
 */
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { alertAdmin } from "@/lib/alert-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Optional body to label the test — admin can tag the email subject
  let label = "manual test"
  try {
    const body = (await req.json()) as { label?: string }
    if (typeof body?.label === "string" && body.label.trim()) {
      label = body.label.trim().slice(0, 64)
    }
  } catch {
    // No body or invalid JSON — fine, use default label
  }

  // Unique dedup key per request so the test always actually sends,
  // even if a prior test fired moments ago.
  const dedupKey = `admin-test-alert:${Date.now()}`

  const result = await alertAdmin({
    severity: "info",
    subject: `Alert pipeline test — ${label}`,
    body:
      `This is a test message triggered manually from /api/admin/test-alert. ` +
      `If you received this, alertAdmin() and Resend domain verification are both working.`,
    details: {
      label,
      timestamp: new Date().toISOString(),
      env: process.env.VERCEL_ENV ?? "local",
    },
    dedupKey,
  })

  if (!result.ok) {
    // Log full reason server-side; return generic to client.
    console.error("[test-alert] alertAdmin failed:", result)
    return NextResponse.json(
      { ok: false, error: "Alert send failed. Check function logs." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, resendId: result.id ?? null })
}
