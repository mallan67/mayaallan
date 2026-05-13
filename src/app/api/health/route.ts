/**
 * Public health endpoint — used by GitHub Actions scheduled monitor.
 *
 * Returns HTTP 200 + status:"ok" when every dependency is reachable.
 * Returns HTTP 503 + status:"degraded" when any check fails.
 *
 * The body is intentionally non-secret; it does not leak credentials,
 * row counts, or internal hints — only "ok/error" booleans + a generic
 * error message per check.
 */
import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic" // never cache — must reflect real-time state

type CheckResult = {
  ok: boolean
  latencyMs?: number
  error?: string
}

async function checkDatabase(): Promise<CheckResult> {
  const t0 = Date.now()
  try {
    const { error } = await supabaseAdmin
      .from(Tables.books)
      .select("id", { head: true, count: "exact" })
      .limit(1)
    const latencyMs = Date.now() - t0
    if (error) return { ok: false, error: error.message, latencyMs }
    return { ok: true, latencyMs }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err), latencyMs: Date.now() - t0 }
  }
}

function checkEnvVar(name: string): CheckResult {
  return process.env[name] ? { ok: true } : { ok: false, error: `${name} not configured` }
}

function checkPaypal(): CheckResult {
  const missing = ["PAYPAL_CLIENT_ID", "PAYPAL_SECRET", "PAYPAL_WEBHOOK_ID"].filter((k) => !process.env[k])
  if (missing.length === 0) return { ok: true }
  return { ok: false, error: `Missing: ${missing.join(", ")}` }
}

export async function GET() {
  const [database] = await Promise.all([checkDatabase()])
  const resend = checkEnvVar("RESEND_API_KEY")
  const blob = checkEnvVar("BLOB_READ_WRITE_TOKEN")
  const paypal = checkPaypal()
  const session = checkEnvVar("SESSION_SECRET")
  const admin = process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD)
    ? { ok: true as const }
    : { ok: false as const, error: "ADMIN_EMAIL or ADMIN_PASSWORD_HASH missing" }

  const checks = { database, resend, blob, paypal, session, admin }
  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      env: process.env.VERCEL_ENV || "development",
    },
    {
      status: allOk ? 200 : 503,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    },
  )
}
