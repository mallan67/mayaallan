/**
 * Resolve the operator email recipient for a given notification kind.
 *
 * Background:
 *   Different notification streams should be addressable independently —
 *   the operator may want contact-form submissions going to one inbox,
 *   newsletter signups to another, and admin alerts to a third. Before
 *   this helper, contact + subscribe routes hard-coded `maya@mayaallan.com`
 *   in multiple places while alerts read `ADMIN_EMAIL` — two sources of
 *   truth, easy to drift.
 *
 * Resolution order (per kind):
 *   contact:     CONTACT_EMAIL          → ADMIN_EMAIL → FALLBACK
 *   newsletter:  NEWSLETTER_NOTIFY_EMAIL → ADMIN_EMAIL → FALLBACK
 *   alert:       ADMIN_EMAIL                          → FALLBACK
 *
 *   FALLBACK is the hard-coded address — only reached if every prior
 *   env var is unset. We log when it's used so a misconfigured site
 *   doesn't silently lose admin visibility.
 */

const FALLBACK_RECIPIENT = "maya@mayaallan.com"

type RecipientKind = "contact" | "newsletter" | "alert"

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim()
  return value ? value : null
}

/**
 * Returns the resolved recipient email and a label noting which env var
 * supplied it (or "fallback" if none did). Caller treats the email as
 * opaque — no leaking the source name to public users.
 */
export function resolveOperatorRecipient(kind: RecipientKind): {
  email: string
  source: string
} {
  const adminEmail = readEnv("ADMIN_EMAIL")

  if (kind === "contact") {
    const specific = readEnv("CONTACT_EMAIL")
    if (specific) return { email: specific, source: "CONTACT_EMAIL" }
    if (adminEmail) return { email: adminEmail, source: "ADMIN_EMAIL" }
    return { email: FALLBACK_RECIPIENT, source: "fallback" }
  }

  if (kind === "newsletter") {
    const specific = readEnv("NEWSLETTER_NOTIFY_EMAIL")
    if (specific) return { email: specific, source: "NEWSLETTER_NOTIFY_EMAIL" }
    if (adminEmail) return { email: adminEmail, source: "ADMIN_EMAIL" }
    return { email: FALLBACK_RECIPIENT, source: "fallback" }
  }

  // alert
  if (adminEmail) return { email: adminEmail, source: "ADMIN_EMAIL" }
  return { email: FALLBACK_RECIPIENT, source: "fallback" }
}
