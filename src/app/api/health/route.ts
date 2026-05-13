/**
 * Public health endpoint — used by GitHub Actions scheduled monitor.
 *
 * Default (cheap) mode is appropriate for high-frequency monitors:
 *   - Database: one indexed-PK row read (no count, no scan)
 *   - Resend / Blob / PayPal / session / admin: env-var presence checks
 *     (env presence is what would BREAK if the Vercel integration drops a
 *     variable; deeper API probes every 15 min would burn rate limits)
 *
 * Deep mode (`?deep=1`) is appropriate for manual debugging or ad-hoc audits:
 *   - Performs real API reachability for Resend (auth probe) and PayPal
 *     (OAuth token exchange). Not used by the cron monitor.
 *
 * Response body never includes raw upstream error text — those can leak schema
 * names, constraint hints, internal endpoints. Errors are logged server-side
 * with full detail and surfaced to the client as a short generic string.
 */
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { apiBase as paypalApiBase } from "@/lib/paypal"

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
    // Single-row PK read — fast, no count/scan, exercises auth and connectivity.
    const { error } = await supabaseAdmin
      .from(Tables.books)
      .select("id")
      .limit(1)
    const latencyMs = Date.now() - t0
    if (error) {
      console.error("[health] database probe failed:", error.message, error.code, error.details)
      return { ok: false, error: "Database unreachable", latencyMs }
    }
    return { ok: true, latencyMs }
  } catch (err: any) {
    console.error("[health] database probe threw:", err)
    return { ok: false, error: "Database unreachable", latencyMs: Date.now() - t0 }
  }
}

function checkEnvPresent(name: string): CheckResult {
  return process.env[name]
    ? { ok: true }
    : { ok: false, error: `${name} not configured` }
}

function checkPaypalEnv(): CheckResult {
  const missing: string[] = []
  if (!process.env.PAYPAL_CLIENT_ID) missing.push("PAYPAL_CLIENT_ID")
  if (!(process.env.PAYPAL_CLIENT_SECRET ?? process.env.PAYPAL_SECRET)) {
    missing.push("PAYPAL_CLIENT_SECRET (or legacy PAYPAL_SECRET)")
  }
  if (!process.env.PAYPAL_WEBHOOK_ID) missing.push("PAYPAL_WEBHOOK_ID")
  if (missing.length === 0) return { ok: true }
  return { ok: false, error: `Missing: ${missing.join(", ")}` }
}

function checkAdminEnv(): CheckResult {
  if (!process.env.ADMIN_EMAIL) {
    return { ok: false, error: "ADMIN_EMAIL not configured" }
  }
  if (!(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD)) {
    return { ok: false, error: "ADMIN_PASSWORD_HASH (or legacy ADMIN_PASSWORD) not configured" }
  }
  return { ok: true }
}

// Deep checks — only run when ?deep=1. Use sparingly (real API calls).
async function deepResend(): Promise<CheckResult> {
  const t0 = Date.now()
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" }
  try {
    const r = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    })
    const latencyMs = Date.now() - t0
    if (!r.ok) {
      console.error("[health] deep resend probe failed:", r.status)
      return { ok: false, error: `Resend API HTTP ${r.status}`, latencyMs }
    }
    return { ok: true, latencyMs }
  } catch (err: any) {
    console.error("[health] deep resend probe threw:", err)
    return { ok: false, error: "Resend API unreachable", latencyMs: Date.now() - t0 }
  }
}

async function deepPaypal(): Promise<CheckResult> {
  const t0 = Date.now()
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? process.env.PAYPAL_SECRET
  if (!clientId || !clientSecret) {
    return { ok: false, error: "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured" }
  }
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const r = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
    const latencyMs = Date.now() - t0
    if (!r.ok) {
      console.error("[health] deep paypal probe failed:", r.status)
      return { ok: false, error: `PayPal API HTTP ${r.status}`, latencyMs }
    }
    return { ok: true, latencyMs }
  } catch (err: any) {
    console.error("[health] deep paypal probe threw:", err)
    return { ok: false, error: "PayPal API unreachable", latencyMs: Date.now() - t0 }
  }
}

export async function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("deep") === "1"

  const database = await checkDatabase()
  const resend = deep ? await deepResend() : checkEnvPresent("RESEND_API_KEY")
  const blob = checkEnvPresent("BLOB_READ_WRITE_TOKEN")
  const paypal = deep ? await deepPaypal() : checkPaypalEnv()
  const session = checkEnvPresent("SESSION_SECRET")
  const admin = checkAdminEnv()

  const checks = { database, resend, blob, paypal, session, admin }
  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      mode: deep ? "deep" : "cheap",
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
