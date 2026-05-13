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

export async function alertAdmin(opts: {
  subject: string
  body: string
  severity?: AlertSeverity
  details?: Record<string, unknown>
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const severity = opts.severity ?? "warning"
  const resendKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL

  if (!resendKey || !adminEmail) {
    console.error("[alertAdmin] RESEND_API_KEY or ADMIN_EMAIL not configured — alert dropped:", opts.subject)
    return { ok: false, error: "RESEND_API_KEY or ADMIN_EMAIL not configured" }
  }

  const { emoji, color } = SEVERITY_META[severity]
  const subject = `${emoji} [${severity.toUpperCase()}] ${opts.subject}`

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
