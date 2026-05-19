/**
 * POST /api/checkout/stripe — start a book direct-sale Stripe Checkout.
 *
 * Mirrors the interface of /api/checkout/paypal so PaymentButtons can call
 * either endpoint without UI changes. Returns { url } pointing at Stripe's
 * hosted checkout — the customer is redirected there to complete payment.
 *
 * Three manual prerequisites (same as PayPal):
 *   1. `allow_direct_sale` must be TRUE on the book row.
 *   2. `ebook_price` must be > 0.
 *   3. `ebook_file_url` must point at the actual ebook PDF in Vercel Blob.
 *
 * Unlike the PayPal flow, there is NO separate capture-on-return route.
 * Stripe captures at checkout-completion automatically; the webhook
 * (/api/checkout/stripe/webhook) handles fulfillment — order row,
 * download token, email delivery.
 */
import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { alertAdmin } from "@/lib/alert-admin"
import { createBookCheckoutSession, safeStripeModeLabel } from "@/lib/stripe"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { trackMarketingEvent, snapshotAttributionFromRequest } from "@/lib/marketing-events"
import { siteUrl } from "@/lib/site-url"
import { createHash } from "node:crypto"
import { z } from "zod"

export const runtime = "nodejs"
export const maxDuration = 60

const checkoutSchema = z.object({
  bookId: z.number().int().positive(),
})

/** Hash an IP / user-agent for the soft-binding columns. SHA-256 truncated. */
function hashForBinding(value: string | null | undefined): string | null {
  if (!value) return null
  return createHash("sha256").update(value).digest("hex").slice(0, 64)
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  // Per-IP rate-limit — same envelope as PayPal so abuse patterns can't
  // pivot from one checkout to the other.
  const limit = rateLimit({
    scope: "stripe-checkout",
    ip,
    windowMs: 15 * 60 * 1000,
    maxAttempts: 15,
    lockoutMs: 30 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  try {
    const body = await request.json()
    const { bookId } = checkoutSchema.parse(body)

    const { data: book, error } = await supabaseAdmin
      .from(Tables.books)
      .select("*")
      .eq("id", bookId)
      .single()

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }
    if (!book.allow_direct_sale || !book.ebook_price) {
      return NextResponse.json({ error: "Book not available for direct sale" }, { status: 400 })
    }
    if (!book.ebook_file_url) {
      return NextResponse.json({ error: "Ebook file not configured. Please contact support." }, { status: 400 })
    }

    // Create the Stripe Checkout Session.
    let checkout: { url: string; sessionId: string }
    try {
      checkout = await createBookCheckoutSession({
        bookId,
        bookSlug: book.slug,
        bookTitle: book.title ?? "Ebook",
        bookSubtitle: book.subtitle1 ?? null,
        priceUsd: Number(book.ebook_price),
        siteUrl: siteUrl(),
      })
    } catch (err) {
      console.error("Stripe checkout session creation failed:", err)
      await alertAdmin({
        severity: "error",
        subject: "Stripe checkout: create-session failed",
        body:
          "Stripe rejected the create-checkout-session request. Customers cannot " +
          "complete a Stripe checkout until this is resolved. Common causes: invalid " +
          "STRIPE_SECRET_KEY, Stripe-side outage, account in restricted state.",
        details: {
          bookId,
          stripeMode: safeStripeModeLabel(),
          errorMessage: err instanceof Error ? err.message : String(err),
        },
        dedupKey: "stripe:create-session-failed",
      })
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 503 })
    }

    // Snapshot attribution BEFORE we hand the buyer off to Stripe — the
    // webhook is server-to-server and has no cookies to read. Persist to
    // pending_paypal_orders so the existing schema is reused (we'll add a
    // stripe_session_id column in a follow-up migration; for now the same
    // table holds both flows distinguished by which id column is populated).
    const attribution = snapshotAttributionFromRequest(request)

    const { error: pendingInsertError } = await supabaseAdmin
      .from("pending_paypal_orders")
      .insert({
        // Reuse the same row but populate the new stripe_session_id column.
        // paypal_order_id can be null for Stripe-originated rows; if your
        // schema enforces NOT NULL, see the migration note below.
        paypal_order_id: checkout.sessionId, // dual-purpose: PayPal order id OR Stripe session id
        book_id: bookId,
        book_slug: book.slug,
        ip_hash: hashForBinding(ip),
        user_agent_hash: hashForBinding(request.headers.get("user-agent")),
        status: "pending",
        visitor_id: attribution.visitorId,
        session_id: attribution.sessionId,
        utm_source: attribution.utmSource,
        utm_medium: attribution.utmMedium,
        utm_campaign: attribution.utmCampaign,
        utm_content: attribution.utmContent,
        utm_term: attribution.utmTerm,
        landing_page: attribution.landingPage,
        referrer: attribution.referrer,
      })

    if (pendingInsertError) {
      // Stripe session is created on Stripe's side regardless. Webhook will
      // still fulfill on success — but we lose the attribution snapshot.
      // Alert so we don't silently lose campaign credit on this sale.
      console.error("pending_paypal_orders insert for Stripe session failed:", pendingInsertError)
      await alertAdmin({
        severity: "warning",
        subject: "Stripe checkout: attribution snapshot insert failed",
        body:
          "Failed to persist the attribution snapshot for an in-flight Stripe checkout. " +
          "If the buyer completes payment, the webhook will fulfill the order, but the " +
          "campaign attribution will be missing. Investigate the Supabase error and " +
          "consider whether pending_paypal_orders' paypal_order_id column needs to be " +
          "nullable to support Stripe session ids alongside PayPal order ids.",
        details: { stripeSessionId: checkout.sessionId, bookId, errorCode: pendingInsertError.code },
        dedupKey: `stripe:pending-insert-failed:${checkout.sessionId}`,
      })
      // Don't fail the checkout — the buyer can still complete and we'll
      // still fulfill via webhook (just without campaign attribution).
    }

    // Track checkout_started. Capped at 2s — must not delay redirect.
    try {
      const trackPromise = trackMarketingEvent({
        request,
        eventName: "checkout_started",
        path: "/api/checkout/stripe",
        properties: {
          book_id: bookId,
          slug: book.slug,
          title: typeof book.title === "string" ? book.title.slice(0, 128) : null,
          price: Number(book.ebook_price),
          format: "ebook",
          processor: "stripe",
          stripe_session_id: checkout.sessionId,
        },
      })
      const trackTimeout = new Promise<void>((resolve) => setTimeout(() => resolve(), 2_000))
      await Promise.race([trackPromise, trackTimeout])
    } catch (trackErr) {
      console.error("[stripe checkout] tracking failed:", trackErr)
    }

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 })
    }
    console.error("Stripe checkout error:", error)
    await alertAdmin({
      severity: "error",
      subject: "Stripe checkout: handler threw unexpectedly",
      body:
        "The Stripe checkout handler threw an unexpected error. No money has " +
        "changed hands at this stage. Customers cannot complete a Stripe purchase " +
        "until this is resolved.",
      details: { errorMessage: (error as any)?.message ?? String(error) },
      dedupKey: "stripe:checkout-handler-threw",
    })
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
