/**
 * Stripe SDK + webhook helpers.
 *
 * Env vars:
 *   STRIPE_SECRET_KEY              (server-only — sk_live_… / sk_test_…)
 *   STRIPE_WEBHOOK_SECRET          (server-only — whsec_…)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (safe to ship to client — pk_live_…)
 *
 * Mirrors the architectural conventions of src/lib/paypal.ts:
 *   - lazy single-flight initialization
 *   - ensureEnv on demand so build doesn't fail when keys aren't set
 *   - safeStripeModeLabel() for alert payloads (never throws)
 *
 * Why Stripe alongside PayPal: PayPal's hosted checkout reads its own
 * session cookies on paypal.com, exposing a previous user's account info
 * to the next user on shared devices. Stripe Checkout has no such cross-
 * merchant session model — prefill is scoped to the merchant's own
 * Customer object with a 30-minute expiry. See deep-research brief
 * for the full architectural comparison.
 */
import "server-only"
import Stripe from "stripe"
import { SITE_URL } from "@/lib/identity"

function ensureEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

let _stripe: Stripe | null = null

/**
 * Get the Stripe SDK client. Lazy single-flight init so the build doesn't
 * fail when STRIPE_SECRET_KEY isn't set in the build env (it isn't needed
 * at build time; only at request time).
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const apiKey = ensureEnv("STRIPE_SECRET_KEY")
  // We deliberately do NOT pin apiVersion. The SDK defaults to the API
  // version your Stripe account is configured for — set in the Dashboard
  // (Developers → API versions). Pinning here would cause a silent split
  // between the version webhook payloads use (dashboard-pinned) and the
  // version this SDK sends (code-pinned), which makes payload-shape
  // assumptions brittle. Manage versioning in one place: the dashboard.
  _stripe = new Stripe(apiKey, {
    typescript: true,
    appInfo: {
      name: "mayaallan.com",
      url: SITE_URL,
    },
    // 10s timeout caps how long a slow Stripe API can chew the function
    // budget — matches the timeout pattern in src/lib/paypal.ts.
    timeout: 10_000,
  })
  return _stripe
}

/**
 * Returns "live" | "test" | "unknown" based on the SECRET key prefix.
 * Never throws — safe to call from alert payloads / catch blocks.
 *
 * Stripe encodes the mode in the key prefix:
 *   sk_live_…  → live
 *   sk_test_…  → test
 *   anything else → unknown (or unconfigured)
 */
export function safeStripeModeLabel(): "live" | "test" | "unknown" | "unconfigured" {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return "unconfigured"
  if (key.startsWith("sk_live_")) return "live"
  if (key.startsWith("sk_test_")) return "test"
  return "unknown"
}

/**
 * Hard guard: throws in production if the secret key isn't live mode.
 * Use sparingly — the soft `safeStripeModeLabel()` is the right tool for
 * logging/alerting.
 */
function isProductionEnv(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
}

export function assertProductionStripeLive(): void {
  if (!isProductionEnv()) return
  const label = safeStripeModeLabel()
  if (label !== "live") {
    throw new Error(
      `Stripe is configured for "${label}" in production. ` +
      `STRIPE_SECRET_KEY must start with sk_live_ for live transactions.`,
    )
  }
}

// --------------------------------------------------------------------
// Webhook signature verification
// --------------------------------------------------------------------

/**
 * Verify and parse a Stripe webhook event from the raw body + signature
 * header. Throws on tamper / wrong-secret — callers should catch and
 * alertAdmin.
 *
 * Stripe's library does the HMAC SHA256 + timestamp validation; we just
 * wrap it for ergonomic catch-and-alert. The `whSecret` argument is
 * optional and falls back to the env var (mirrors the pattern in
 * src/lib/paypal.ts for the multi-webhook session-export flow).
 */
export function verifyStripeWebhook(
  rawBody: string,
  signatureHeader: string | null | undefined,
  whSecret?: string,
): Stripe.Event {
  if (!signatureHeader) {
    throw new Error("Missing Stripe-Signature header")
  }
  const secret = whSecret?.trim() || ensureEnv("STRIPE_WEBHOOK_SECRET")
  const stripe = getStripe()
  // constructEvent validates the signature timestamp + HMAC. Default
  // tolerance is 300s (matches Stripe's recommendation).
  return stripe.webhooks.constructEvent(rawBody, signatureHeader, secret)
}

// --------------------------------------------------------------------
// Checkout helpers
// --------------------------------------------------------------------

const BOOK_CHECKOUT_METADATA_KIND = "book_purchase"
const SESSION_EXPORT_METADATA_KIND = "session_export"

export type BookCheckoutMetadata = {
  kind: typeof BOOK_CHECKOUT_METADATA_KIND
  book_id: string // stringified — Stripe metadata values are always strings
  book_slug: string
}

export type SessionExportMetadata = {
  kind: typeof SESSION_EXPORT_METADATA_KIND
  blob_key: string
  tool: "reset" | "belief_inquiry" | "integration"
}

/**
 * Create a Checkout Session for a book purchase. Returns the hosted
 * checkout URL the customer should be redirected to.
 *
 * Why metadata.kind: when the webhook fires, it needs to distinguish a
 * book purchase from a session-export purchase (different fulfillment
 * paths). PayPal solved this via custom_id shape (numeric vs `blob|tool`);
 * Stripe solves it cleaner via structured metadata.
 */
export async function createBookCheckoutSession(args: {
  bookId: number
  bookSlug: string
  bookTitle: string
  bookSubtitle?: string | null
  priceUsd: number
  siteUrl: string
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe()

  const metadata: BookCheckoutMetadata = {
    kind: BOOK_CHECKOUT_METADATA_KIND,
    book_id: String(args.bookId),
    book_slug: args.bookSlug,
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // automatic_payment_methods enables every payment method enabled in
    // the Stripe Dashboard for this account — card, Apple Pay, Google Pay,
    // Link, PayPal (when connected). Keeps the merchant in control of
    // which methods appear via Dashboard toggles, not code.
    payment_method_types: undefined,
    automatic_tax: { enabled: false },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(args.priceUsd * 100),
          product_data: {
            name: args.bookTitle,
            description: args.bookSubtitle?.slice(0, 200) ?? undefined,
            metadata: { book_id: String(args.bookId) },
          },
        },
      },
    ],
    metadata: metadata as unknown as Stripe.MetadataParam,
    // Customer collects email (required for download delivery). Stripe
    // does NOT pre-fill from a previous merchant's checkout session —
    // unlike PayPal's session-cookie behavior. This is the whole reason
    // we migrated.
    customer_email: undefined,
    customer_creation: "if_required",
    billing_address_collection: "auto",
    success_url: `${args.siteUrl}/books/${args.bookSlug}?payment=success&stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${args.siteUrl}/books/${args.bookSlug}?payment=cancelled`,
    // 30 minutes — matches PayPal's pending_paypal_orders TTL.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })

  if (!session.url) {
    throw new Error("Stripe checkout session created but no URL returned")
  }
  return { url: session.url, sessionId: session.id }
}

/**
 * Create a Checkout Session for a Save-Session-as-PDF purchase.
 * Mirrors createBookCheckoutSession but with session-export-specific
 * metadata so the webhook routes correctly.
 */
export async function createSessionExportCheckoutSession(args: {
  blobKey: string
  tool: "reset" | "belief_inquiry" | "integration"
  priceUsd: number
  siteUrl: string
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe()

  const metadata: SessionExportMetadata = {
    kind: SESSION_EXPORT_METADATA_KIND,
    blob_key: args.blobKey,
    tool: args.tool,
  }

  const toolDisplay =
    args.tool === "reset" ? "Nervous System Reset" :
    args.tool === "belief_inquiry" ? "Belief Inquiry" :
    "Integration"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    automatic_tax: { enabled: false },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(args.priceUsd * 100),
          product_data: {
            name: `${toolDisplay} — Session PDF`,
            description: "Save your reflection session as a printable PDF, emailed after payment.",
          },
        },
      },
    ],
    metadata: metadata as unknown as Stripe.MetadataParam,
    customer_email: undefined,
    customer_creation: "if_required",
    billing_address_collection: "auto",
    success_url: `${args.siteUrl}/export/success?tool=${args.tool}&stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${args.siteUrl}/tools`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })

  if (!session.url) {
    throw new Error("Stripe checkout session created but no URL returned")
  }
  return { url: session.url, sessionId: session.id }
}

/**
 * Decode the metadata on a Checkout Session into a typed flow discriminator.
 * Returns null if the metadata is missing or unrecognised — webhook should
 * silently ignore (the event isn't ours).
 */
export function decodeCheckoutMetadata(
  metadata: Stripe.Metadata | null | undefined,
): BookCheckoutMetadata | SessionExportMetadata | null {
  if (!metadata || typeof metadata !== "object") return null
  const kind = metadata.kind
  if (kind === BOOK_CHECKOUT_METADATA_KIND) {
    const bookId = metadata.book_id
    const bookSlug = metadata.book_slug
    if (typeof bookId !== "string" || typeof bookSlug !== "string") return null
    return { kind: BOOK_CHECKOUT_METADATA_KIND, book_id: bookId, book_slug: bookSlug }
  }
  if (kind === SESSION_EXPORT_METADATA_KIND) {
    const blobKey = metadata.blob_key
    const tool = metadata.tool
    if (typeof blobKey !== "string" || (tool !== "reset" && tool !== "belief_inquiry" && tool !== "integration")) {
      return null
    }
    return { kind: SESSION_EXPORT_METADATA_KIND, blob_key: blobKey, tool }
  }
  return null
}
