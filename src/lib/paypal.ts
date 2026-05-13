/**
 * PayPal Orders v2 + webhook verification.
 *
 * Env vars:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET (or PAYPAL_SECRET — both names accepted for compatibility
 *                         with the older book-checkout flow which uses PAYPAL_SECRET)
 *   PAYPAL_WEBHOOK_ID
 *   PAYPAL_ENV          "sandbox" | "live"  (defaults to "sandbox")
 */

function ensureEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function getPaypalClientSecret(): string {
  const value = process.env.PAYPAL_CLIENT_SECRET ?? process.env.PAYPAL_SECRET
  if (!value) {
    throw new Error("Missing required env var: PAYPAL_CLIENT_SECRET (or PAYPAL_SECRET)")
  }
  return value
}

/**
 * Resolve PayPal's API base from one canonical env var.
 *
 * Strict precedence:
 *   1. PAYPAL_ENV (preferred). Must be exactly "live" or "sandbox".
 *      Any other value (e.g. "liv", "production", "test") THROWS in
 *      production so a typo doesn't silently send live traffic to
 *      sandbox or vice versa.
 *   2. PAYPAL_API_BASE (legacy fallback). Must be exactly the live or
 *      sandbox API URL. Any other value THROWS in production.
 *   3. Neither set: falls back to sandbox in non-production; THROWS in
 *      production (we never want unconfigured PayPal in prod).
 *
 * In non-production environments (dev / preview), invalid values
 * fall back to sandbox with a console warning so local development
 * isn't blocked by a typo.
 *
 * Callers (checkout, return, webhook) already wrap getAccessToken() in
 * try/catch + alertAdmin. A throw here propagates through that path,
 * so an invalid PAYPAL_ENV in production surfaces as a critical alert
 * rather than silent sandbox/live drift.
 */
const KNOWN_LIVE_BASE = "https://api-m.paypal.com"
const KNOWN_SANDBOX_BASE = "https://api-m.sandbox.paypal.com"

function isProductionEnv(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
}

export function apiBase(): string {
  const envRaw = process.env.PAYPAL_ENV
  if (envRaw !== undefined && envRaw !== "") {
    const env = envRaw.trim().toLowerCase()
    if (env === "live") return KNOWN_LIVE_BASE
    if (env === "sandbox") return KNOWN_SANDBOX_BASE

    const msg = `Invalid PAYPAL_ENV value: ${JSON.stringify(envRaw)} (expected "live" or "sandbox")`
    if (isProductionEnv()) {
      throw new Error(msg)
    }
    console.warn(`[paypal] ${msg} — falling back to sandbox (non-production only)`)
    return KNOWN_SANDBOX_BASE
  }

  const baseRaw = process.env.PAYPAL_API_BASE?.trim()
  if (baseRaw) {
    if (baseRaw === KNOWN_LIVE_BASE) return KNOWN_LIVE_BASE
    if (baseRaw === KNOWN_SANDBOX_BASE) return KNOWN_SANDBOX_BASE

    const msg = `Invalid PAYPAL_API_BASE value: ${JSON.stringify(baseRaw)} (expected ${KNOWN_LIVE_BASE} or ${KNOWN_SANDBOX_BASE})`
    if (isProductionEnv()) {
      throw new Error(msg)
    }
    console.warn(`[paypal] ${msg} — falling back to sandbox (non-production only)`)
    return KNOWN_SANDBOX_BASE
  }

  // Neither env var set.
  if (isProductionEnv()) {
    throw new Error(
      "PayPal is not configured for production: set PAYPAL_ENV=live (or =sandbox for testing). " +
      "PAYPAL_API_BASE is also accepted as a legacy fallback."
    )
  }
  return KNOWN_SANDBOX_BASE
}

/**
 * Returns 'live' | 'sandbox'. Useful for logging and admin alerts.
 */
export function paypalEnvLabel(): "live" | "sandbox" {
  return apiBase() === "https://api-m.paypal.com" ? "live" : "sandbox"
}

type CachedToken = { token: string; expiresAt: number }
let cachedToken: CachedToken | null = null

/**
 * Get a cached OAuth access token. Cached in-memory until ~30s before
 * expiry. Throws on failure (callers catch + alertAdmin).
 *
 * Exported so the book-checkout / return-capture / webhook-verification
 * routes can all share a single OAuth call instead of each hand-rolling
 * their own.
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token
  }

  const clientId = ensureEnv("PAYPAL_CLIENT_ID")
  const clientSecret = getPaypalClientSecret()
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("PayPal OAuth failed", {
      httpStatus: res.status,
      apiBase: apiBase(),
      paypalEnv: process.env.PAYPAL_ENV ?? "sandbox",
      hasClientId: !!process.env.PAYPAL_CLIENT_ID,
      hasClientSecret: !!(process.env.PAYPAL_CLIENT_SECRET ?? process.env.PAYPAL_SECRET),
      responseBody: text.slice(0, 2000),
    })
    throw new Error(`PayPal OAuth failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return data.access_token
}

const SESSION_PRICE_USD = "9.99"
const SEPARATOR = "|"

export function encodeCustomId(blobKey: string, tool: string): string {
  return `${blobKey}${SEPARATOR}${tool}`
}

export function decodeCustomId(
  customId: string
): { blobKey: string; tool: "reset" | "belief_inquiry" | "integration" } | null {
  const idx = customId.lastIndexOf(SEPARATOR)
  if (idx < 0) return null
  const blobKey = customId.slice(0, idx)
  const tool = customId.slice(idx + 1)
  if (tool !== "reset" && tool !== "belief_inquiry" && tool !== "integration") return null
  if (!blobKey) return null
  return { blobKey, tool }
}

export async function createSessionExportOrder(args: {
  blobKey: string
  customerEmail: string
  tool: "reset" | "belief_inquiry" | "integration"
  siteUrl: string
}): Promise<{ url: string; orderId: string }> {
  const token = await getAccessToken()
  const customId = encodeCustomId(args.blobKey, args.tool)

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: customId,
        description: "Save Your Session (PDF)",
        amount: { currency_code: "USD", value: SESSION_PRICE_USD },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${args.siteUrl}/export/success?tool=${args.tool}`,
          cancel_url: `${args.siteUrl}/tools`,
        },
        email_address: args.customerEmail,
      },
    },
  }

  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("PayPal order creation failed", {
      httpStatus: res.status,
      apiBase: apiBase(),
      paypalEnv: process.env.PAYPAL_ENV ?? "sandbox",
      hasClientId: !!process.env.PAYPAL_CLIENT_ID,
      hasClientSecret: !!(process.env.PAYPAL_CLIENT_SECRET ?? process.env.PAYPAL_SECRET),
      responseBody: text.slice(0, 2000),
    })
    throw new Error(`PayPal order creation failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as {
    id: string
    links: Array<{ rel: string; href: string; method: string }>
  }

  const approveLink = data.links.find((l) => l.rel === "payer-action" || l.rel === "approve")
  if (!approveLink) {
    throw new Error("PayPal order created but no approve link returned")
  }

  return { url: approveLink.href, orderId: data.id }
}

export type PaypalWebhookHeaders = {
  authAlgo: string | null
  certUrl: string | null
  transmissionId: string | null
  transmissionSig: string | null
  transmissionTime: string | null
}

export function extractWebhookHeaders(req: {
  headers: { get(name: string): string | null }
}): PaypalWebhookHeaders {
  return {
    authAlgo: req.headers.get("paypal-auth-algo"),
    certUrl: req.headers.get("paypal-cert-url"),
    transmissionId: req.headers.get("paypal-transmission-id"),
    transmissionSig: req.headers.get("paypal-transmission-sig"),
    transmissionTime: req.headers.get("paypal-transmission-time"),
  }
}

export async function verifyPaypalWebhook(
  headers: PaypalWebhookHeaders,
  rawBody: string
): Promise<boolean> {
  if (
    !headers.authAlgo ||
    !headers.certUrl ||
    !headers.transmissionId ||
    !headers.transmissionSig ||
    !headers.transmissionTime
  ) {
    return false
  }

  const webhookId = ensureEnv("PAYPAL_WEBHOOK_ID")
  const token = await getAccessToken()

  let webhookEvent: unknown
  try {
    webhookEvent = JSON.parse(rawBody)
  } catch {
    return false
  }

  const res = await fetch(`${apiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  })

  if (!res.ok) return false
  const data = (await res.json()) as { verification_status?: string }
  return data.verification_status === "SUCCESS"
}
