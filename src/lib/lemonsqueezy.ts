import crypto from "node:crypto"
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js"

function ensureEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

let configured = false
function configure() {
  if (configured) return
  lemonSqueezySetup({ apiKey: ensureEnv("LEMONSQUEEZY_API_KEY") })
  configured = true
}

export async function createSessionExportCheckout(args: {
  blobKey: string
  customerEmail: string
  tool: "reset" | "belief_inquiry" | "integration"
  siteUrl: string
}): Promise<{ url: string }> {
  configure()
  const storeId = ensureEnv("LEMONSQUEEZY_STORE_ID")
  const productId = ensureEnv("LEMONSQUEEZY_PRODUCT_ID")

  const { data, error } = await createCheckout(storeId, productId, {
    checkoutData: {
      email: args.customerEmail,
      custom: {
        blob_key: args.blobKey,
        tool: args.tool,
      },
    },
    productOptions: {
      redirectUrl: `${args.siteUrl}/export/success?tool=${args.tool}`,
      receiptButtonText: "Return to site",
      receiptLinkUrl: args.siteUrl,
    },
  })

  if (error || !data?.data?.attributes?.url) {
    throw new Error(
      `Lemon Squeezy checkout creation failed: ${error?.message ?? "no URL returned"}`
    )
  }

  return { url: data.data.attributes.url }
}

/**
 * Verify Lemon Squeezy webhook signature.
 * LS uses HMAC-SHA256 over the raw request body with the webhook signing secret.
 */
export function verifyLemonSqueezySignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false
  const secret = ensureEnv("LEMONSQUEEZY_WEBHOOK_SECRET")
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(rawBody)
  const expected = hmac.digest("hex")
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, "hex"),
      Buffer.from(expected, "hex")
    )
  } catch {
    return false
  }
}
