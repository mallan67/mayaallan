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

function apiBase(): string {
  const env = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase()
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

type CachedToken = { token: string; expiresAt: number }
let cachedToken: CachedToken | null = null

async function getAccessToken(): Promise<string> {
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
