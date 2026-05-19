/**
 * Resolve the canonical site URL for outgoing links (checkout return URLs,
 * download links in purchase emails, etc).
 *
 * Strict in production: throws if NEXT_PUBLIC_SITE_URL isn't set. The
 * previous pattern -- `process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"`
 * -- silently shipped localhost URLs to customers if the env var was
 * forgotten on a deploy. That puts download tokens into emails pointing
 * at a host the customer can't reach AND leaks the token to whatever
 * resolved localhost on the customer's network.
 *
 * Local dev (no VERCEL_ENV, no NODE_ENV=production) falls back to
 * http://localhost:3000 so the dev flow keeps working without setting
 * the var explicitly.
 */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, "")

  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV)
  if (isProduction) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required in production. " +
      "Without it, customer-facing links would point at http://localhost:3000.",
    )
  }
  return "http://localhost:3000"
}
