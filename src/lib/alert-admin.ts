/**
 * Send a transactional alert email to ADMIN_EMAIL via Resend.
 *
 * Use this when a server-side path needs to surface a failure to the operator
 * (e.g. PayPal webhook fails to send a download email, a job errors, a
 * scheduled task hits an unexpected state). Never throws — returns { ok }.
 *
 * Example:
 *   await alertAdmin({
 *     subject: "PayPal email delivery failed",
 *     body: "Order #42 paid but Resend rejected the email.",
 *     severity: "error",
 *     details: { orderId, resendError },
 *   })
 */
import "server-only"
import { Resend } from "resend"
import { getUpstash } from "@/lib/upstash"

export type AlertSeverity = "info" | "warning" | "error" | "critical"

const SEVERITY_META: Record<AlertSeverity, { emoji: string; color: string }> = {
  info:     { emoji: "ℹ️",  color: "#0D6EBF" },
  warning:  { emoji: "⚠️",  color: "#D4A520" },
  error:    { emoji: "🔴", color: "#B91C1C" },
  critical: { emoji: "🚨", color: "#7F1D1D" },
}

const HTML_ENTITIES: Record<string, string> = {
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;",
}
const escapeHtml = (s: string) => s.replace(/[<>&"']/g, (c) => HTML_ENTITIES[c]!)

// Two-layer dedup:
//
//   1. In-memory Map  — fastest, but resets on serverless cold start. Useful
//      for catching same-instance bursts within milliseconds.
//   2. Upstash Redis  — persistent across cold starts AND across multiple
//      concurrent function instances. This is what makes 24h dedup actually
//      last 24h instead of "until the next cold start." Best-effort: if
//      Upstash is unavailable, we fall through to in-memory only.
//
// Why both: Upstash adds a network call, so a tight loop in a single function
// instance is faster with the in-memory check. Upstash's value is preventing
// a fresh lambda from re-alerting on the same incident moments after another
// lambda already alerted.
const DEFAULT_DEDUP_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const recentAlerts = new Map<string, number>()

function suppressedInMemory(dedupKey: string, windowMs: number): boolean {
  const now = Date.now()
  // Opportunistic eviction (avoid unbounded growth on a long-lived instance)
  if (recentAlerts.size > 256) {
    for (const [k, ts] of recentAlerts) {
      if (now - ts > windowMs) recentAlerts.delete(k)
    }
  }
  const last = recentAlerts.get(dedupKey)
  if (last && now - last < windowMs) return true
  recentAlerts.set(dedupKey, now)
  return false
}

/**
 * Persistent dedup via Upstash. Returns true if another instance has already
 * alerted on this key within the window — we should suppress. Returns false
 * if we just successfully claimed the key (we're the first; alert).
 *
 * Falls through to "not suppressed" if Upstash is unavailable so a temporary
 * Upstash outage doesn't permanently silence alerts. This is the correct
 * failure mode for an alerting path — better to over-alert than miss a real
 * incident because Redis was down.
 */
async function suppressedByUpstash(dedupKey: string, windowMs: number): Promise<boolean> {
  const redis = getUpstash()
  if (!redis) return false
  try {
    const key = `alertdedup:${dedupKey}`
    const seconds = Math.max(1, Math.ceil(windowMs / 1000))
    // SETNX with EX — atomically set if not exists, with TTL. Returns "OK" if
    // we won the race, null if another worker already set it.
    const result = await redis.set(key, "1", { nx: true, ex: seconds })
    return result !== "OK"
  } catch (err) {
    console.error("[alertAdmin] Upstash dedup probe threw:", err instanceof Error ? err.message : String(err))
    return false
  }
}

export async function alertAdmin(opts: {
  subject: string
  body: string
  severity?: AlertSeverity
  details?: Record<string, unknown>
  /** Override the dedup key; defaults to severity + subject. */
  dedupKey?: string
  /** Override the dedup window (ms); defaults to 1 hour. */
  dedupWindowMs?: number
}): Promise<{ ok: true; id?: string } | { ok: false; error: string; suppressed?: boolean }> {
  const severity = opts.severity ?? "warning"
  const dedupKey = opts.dedupKey ?? `${severity}::${opts.subject}`
  const dedupWindowMs = opts.dedupWindowMs ?? DEFAULT_DEDUP_WINDOW_MS

  if (suppressedInMemory(dedupKey, dedupWindowMs)) {
    console.warn(`[alertAdmin] suppressed (in-memory dedup) within ${Math.round(dedupWindowMs / 60_000)}min: ${opts.subject}`)
    return { ok: false, error: "Suppressed by dedup", suppressed: true }
  }

  // Cross-instance / cross-cold-start dedup. Only consulted AFTER the
  // in-memory check passes — if we're already suppressing locally there's
  // no need to chew a network round-trip. The Upstash check is also what
  // prevents two fresh cold-started lambdas from both alerting on the same
  // incident moments apart.
  if (await suppressedByUpstash(dedupKey, dedupWindowMs)) {
    console.warn(`[alertAdmin] suppressed (Upstash dedup) within ${Math.round(dedupWindowMs / 60_000)}min: ${opts.subject}`)
    return { ok: false, error: "Suppressed by dedup", suppressed: true }
  }

  const resendKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL

  if (!resendKey || !adminEmail) {
    console.error("[alertAdmin] RESEND_API_KEY or ADMIN_EMAIL not configured — alert dropped:", opts.subject)
    return { ok: false, error: "RESEND_API_KEY or ADMIN_EMAIL not configured" }
  }

  const { emoji, color } = SEVERITY_META[severity]
  // Tag every subject with the project name so Maya can disambiguate this
  // from alerts coming from other projects that land in the same inbox.
  // Override via ALERT_PROJECT_TAG env var if you ever rename the site.
  const projectTag = process.env.ALERT_PROJECT_TAG || "mayaallan.com"
  const subject = `${emoji} [${projectTag}] [${severity.toUpperCase()}] ${opts.subject}`

  const detailsBlock = opts.details
    ? `<pre style="background:#F4F4F5;padding:14px;margin-top:18px;border-radius:6px;font-size:12px;line-height:1.55;overflow-x:auto;white-space:pre-wrap;word-break:break-word;">${escapeHtml(
        JSON.stringify(opts.details, null, 2),
      )}</pre>`
    : ""

  const html = `
    <div style="font-family: Georgia, serif; max-width: 580px; color: #14110d; line-height: 1.55;">
      <div style="border-left: 4px solid ${color}; padding: 4px 0 4px 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; color: #6B665E; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 4px;">${severity}</div>
        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${escapeHtml(opts.subject)}</h2>
      </div>
      <div style="white-space: pre-wrap;">${escapeHtml(opts.body)}</div>
      ${detailsBlock}
      <p style="margin-top: 28px; padding-top: 14px; border-top: 1px solid #E5E5E7; font-size: 11px; color: #6B665E; font-style: italic;">
        Sent automatically by mayaallan.com · ${new Date().toISOString()} · ${process.env.VERCEL_ENV ?? "local"}
      </p>
    </div>
  `

  try {
    const resend = new Resend(resendKey)
    const { data, error } = await resend.emails.send({
      from: "Maya Allan Alerts <alerts@mayaallan.com>",
      to: adminEmail,
      subject,
      html,
    })
    if (error) {
      console.error("[alertAdmin] Resend rejected the alert:", error)
      return { ok: false, error: error.message ?? String(error) }
    }
    return { ok: true, id: data?.id }
  } catch (err: any) {
    console.error("[alertAdmin] threw:", err)
    return { ok: false, error: err?.message ?? String(err) }
  }
}
