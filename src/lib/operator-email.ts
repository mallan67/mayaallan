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

// One-time-per-cold-start warning so the migration nag stays visible
// in Vercel logs without flooding on every request. The docstring at
// the top of this file promises this logging — it now actually happens.
const warnedFallbackKinds = new Set<RecipientKind>()
function warnFallbackOnce(kind: RecipientKind): void {
  if (warnedFallbackKinds.has(kind)) return
  warnedFallbackKinds.add(kind)
  // eslint-disable-next-line no-console
  console.error(
    `[operator-email] FALLBACK RECIPIENT USED for kind="${kind}". ` +
      "ADMIN_EMAIL (and the kind-specific env var) are unset, so notifications " +
      "for this stream are routing to the hardcoded fallback address. " +
      "Set ADMIN_EMAIL in Vercel env vars.",
  )
}

/**
 * Returns the resolved recipient email and a label noting which env var
 * supplied it (or "fallback" if none did). Caller treats the email as
 * opaque — no leaking the source name to public users.
 *
 * When the fallback path is hit, a one-time-per-cold-start `console.error`
 * surfaces the misconfiguration in Vercel logs. The previous version of
 * this docstring promised that logging but the code didn't deliver it —
 * silent fallback was exactly the failure mode the PR-5B silent-failure
 * sweep is closing.
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
    warnFallbackOnce(kind)
    return { email: FALLBACK_RECIPIENT, source: "fallback" }
  }

  if (kind === "newsletter") {
    const specific = readEnv("NEWSLETTER_NOTIFY_EMAIL")
    if (specific) return { email: specific, source: "NEWSLETTER_NOTIFY_EMAIL" }
    if (adminEmail) return { email: adminEmail, source: "ADMIN_EMAIL" }
    warnFallbackOnce(kind)
    return { email: FALLBACK_RECIPIENT, source: "fallback" }
  }

  // alert
  if (adminEmail) return { email: adminEmail, source: "ADMIN_EMAIL" }
  // NOTE: deliberately no alertAdmin import here. The alert path itself
  // routes through this function — alerting on a missing alert address
  // would be a circular dependency. The console.error above is the only
  // visibility for the alert-fallback case.
  warnFallbackOnce(kind)
  return { email: FALLBACK_RECIPIENT, source: "fallback" }
}
