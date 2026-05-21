/**
 * Safe-log utilities — keep PII out of Vercel function logs.
 *
 * Vercel logs are retained and visible to anyone with project access (now
 * and in the future). The codebase already strips PII from `alertAdmin`
 * payloads (commit d01200b), but raw `console.log` / `console.error` calls
 * have been the exception — full customer emails and Resend error bodies
 * have been logged in places like `src/lib/deliver-pdf.ts`.
 *
 * Use these helpers anywhere you're tempted to `console.log(email)` or
 * `console.error("...", error)` where the error or context might carry PII.
 *
 * Conventions:
 *   - Always log to stderr for errors, stdout for info.
 *   - Structured prefix `[<tag>]` so logs group naturally in Vercel UI.
 *   - PII fields are reduced to (a) email domain only, (b) length only, or
 *     (c) a short SHA prefix when correlation across logs matters.
 */

import crypto from "crypto"

/** Extract just the domain portion of an email. Returns null if not parseable. */
export function emailDomain(email: unknown): string | null {
  if (typeof email !== "string") return null
  const at = email.lastIndexOf("@")
  if (at < 0 || at === email.length - 1) return null
  return email.slice(at + 1).toLowerCase()
}

/**
 * Short, stable, NON-REVERSIBLE handle for correlating logs across requests
 * without exposing the underlying value. SHA-256 truncated to 8 hex chars.
 * Salt prevents rainbow-table reversal across deployments.
 *
 * If SESSION_SECRET is unset, returns "no-salt" instead of computing an
 * unsalted hash — the prior behavior used a hardcoded literal fallback,
 * which made handles deterministically reversible if the env var was ever
 * missing. Correlating logs is non-critical; producing a fake-but-stable
 * hash would only matter for an attacker rainbow-tabling them.
 */
const HANDLE_SALT: string | null = process.env.SESSION_SECRET ?? null
export function shortHandle(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (!HANDLE_SALT) return "no-salt"
  const s = typeof value === "string" ? value : JSON.stringify(value)
  return crypto.createHash("sha256").update(HANDLE_SALT + s).digest("hex").slice(0, 8)
}

/** Coerce an Error-like or string into a short, non-PII string. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

/**
 * Sanitize a Resend error for inclusion in admin alerts. Resend errors
 * commonly echo the recipient address verbatim (e.g.
 *   "The email address user@example.com is invalid"
 *   "missing_required_field: to: user@example.com"
 * ). The d01200b commit established that customer PII must never appear
 * in alertAdmin payloads — this helper enforces that contract for the
 * webhook → resend-failure → alertAdmin path.
 *
 * Returns a sanitized projection: error name + an email-redacted message.
 */
export function sanitizeResendError(err: unknown): {
  name: string
  message: string
} {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : (() => {
            try {
              return JSON.stringify(err)
            } catch {
              return String(err)
            }
          })()
  const name =
    err instanceof Error && typeof err.name === "string" && err.name.length > 0
      ? err.name
      : "Error"
  // Replace any email-shaped substring with <email-redacted>.
  const message = raw.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    "<email-redacted>",
  )
  return { name, message }
}

/**
 * Log an info-level structured event. Pass only fields you've already
 * sanitized (email -> domain, customer id -> shortHandle, etc).
 *
 * Example:
 *   safeLog("export.promo-redeem", {
 *     tool,
 *     emailDomain: emailDomain(body.email),
 *     codeUsed: code,
 *   })
 */
export function safeLog(tag: string, fields: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[${tag}]`, fields)
}

/**
 * Log an error-level structured event. Same sanitization contract as safeLog.
 */
export function safeLogError(tag: string, fields: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.error(`[${tag}]`, fields)
}
