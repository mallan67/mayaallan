import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSession } from "@/lib/session"
import { rateLimit, clearRateLimit, getClientIp } from "@/lib/rate-limit"
import { alertAdmin } from "@/lib/alert-admin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { verifyAdminPassword } from "@/lib/admin-credentials"

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const RATE_LIMIT_SCOPE = "admin-login"

export async function POST(req: Request) {
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  const ip = getClientIp(req)

  const limit = await rateLimit({
    scope: RATE_LIMIT_SCOPE,
    ip,
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    lockoutMs: 30 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
  }
  const { email, password } = parsed.data

  const adminEmail = process.env.ADMIN_EMAIL

  // The password credential may live in the DB (admin_auth, set via the reset
  // flow) and/or in ADMIN_PASSWORD_HASH. Only ADMIN_EMAIL is strictly required
  // here — verifyAdminPassword() resolves the hash from DB-then-env.
  if (!adminEmail) {
    console.error("ADMIN_EMAIL must be set")
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 })
  }

  const emailMatches = email === adminEmail

  let passwordMatches = false
  let bcryptThrew = false
  try {
    passwordMatches = await verifyAdminPassword(password)
  } catch (err) {
    // bcrypt.compare throws when a stored hash is malformed (e.g. the env var
    // got truncated or double-quoted). Previously this silently became
    // "Invalid credentials" forever, locking the admin out with a misleading
    // message. Now: alert + return 500 so the operator knows it's a server
    // config issue, not their password.
    console.error("verifyAdminPassword failed:", err)
    bcryptThrew = true
    await alertAdmin({
      severity: "critical",
      subject: "Admin login: bcrypt.compare threw — ADMIN_PASSWORD_HASH likely corrupted",
      body:
        "bcrypt.compare raised an exception during admin login. The most common " +
        "cause is a malformed ADMIN_PASSWORD_HASH env var (truncated, double-quoted, " +
        "or whitespace-padded). Until this is fixed, every admin login attempt will " +
        "return 500. Regenerate the hash and update the Vercel env var.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "auth:bcrypt-threw",
    })
  }

  if (bcryptThrew) {
    // Generic message — don't leak the internal cause to the client.
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 })
  }

  if (!emailMatches || !passwordMatches) {
    // Failed attempt was already recorded by the initial rateLimit call above.
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })
  }

  // Success — clear rate-limit record so future typos don't accumulate
  await clearRateLimit(RATE_LIMIT_SCOPE, ip)

  const session = await getAdminSession()
  session.adminId = "1"
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ ok: true })
}
