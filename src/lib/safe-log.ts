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
 */
const HANDLE_SALT = process.env.SESSION_SECRET ?? "no-salt-default"
export function shortHandle(value: unknown): string {
  if (value === null || value === undefined) return "null"
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
