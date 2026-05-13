import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getAdminSession } from "@/lib/session"
import { rateLimit, clearRateLimit, getClientIp } from "@/lib/rate-limit"
import { alertAdmin } from "@/lib/alert-admin"

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const RATE_LIMIT_SCOPE = "admin-login"

export async function POST(req: Request) {
  const ip = getClientIp(req)

  const limit = rateLimit({
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
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
  const adminPasswordPlain = process.env.ADMIN_PASSWORD // legacy fallback during migration

  if (!adminEmail || (!adminPasswordHash && !adminPasswordPlain)) {
    console.error("ADMIN_EMAIL and (ADMIN_PASSWORD_HASH or ADMIN_PASSWORD) must be set")
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 })
  }

  const emailMatches = email === adminEmail

  let passwordMatches = false
  let bcryptThrew = false
  if (adminPasswordHash) {
    try {
      passwordMatches = await bcrypt.compare(password, adminPasswordHash)
    } catch (err) {
      // bcrypt.compare throws when the hash itself is malformed (e.g. an
      // env var got truncated or double-quoted). Previously this silently
      // became "Invalid credentials" forever, locking the admin out with
      // a misleading message. Now: alert + return 500 so the operator
      // knows it's a server config issue, not their password.
      console.error("bcrypt.compare failed:", err)
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
  } else if (adminPasswordPlain) {
    console.warn("ADMIN_PASSWORD_HASH not set — falling back to plaintext ADMIN_PASSWORD. Migrate to ADMIN_PASSWORD_HASH (bcrypt) immediately.")
    passwordMatches = password === adminPasswordPlain
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
  clearRateLimit(RATE_LIMIT_SCOPE, ip)

  const session = await getAdminSession()
  session.adminId = "1"
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ ok: true })
}
