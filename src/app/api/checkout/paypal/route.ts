/**
 * POST /api/checkout/paypal — start an ebook direct-sale PayPal checkout.
 *
 * Two manual prerequisites in admin (`/admin/books/<slug>`):
 *   1. `allow_direct_sale` must be TRUE.
 *   2. `ebook_file_url` must point at the actual ebook PDF/EPUB in Vercel Blob
 *      (use the file-upload widget on the book edit page).
 *
 * Without those, this endpoint correctly refuses the checkout. The webhook
 * (/api/payment/paypal/webhook) handles the rest of the flow: order row,
 * download token, email delivery, alertAdmin on failures.
 *
 * Audiobook is intentionally NOT sold through this endpoint — use Gumroad
 * or another external seller and surface it via the per-format
 * `book_retailer_links` table (admin: Retailer Links section).
 */
import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { alertAdmin } from "@/lib/alert-admin"
import { z } from "zod"

const checkoutSchema = z.object({
  bookId: z.number().int().positive(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookId } = checkoutSchema.parse(body)

    // Get book from database
    const { data: book, error } = await supabaseAdmin
      .from(Tables.books)
      .select("*")
      .eq("id", bookId)
      .single()

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (!book.allow_direct_sale || !book.ebook_price) {
      // User-visible config issue (admin needs to enable direct sale + set price).
      // Not alert-worthy — admin sees this state in /admin/books.
      return NextResponse.json({ error: "Book not available for direct sale" }, { status: 400 })
    }

    if (!book.ebook_file_url) {
      // Same as above — user/admin config issue, not a system failure.
      return NextResponse.json({ error: "Ebook file not configured. Please contact support." }, { status: 400 })
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID
    const paypalSecret = process.env.PAYPAL_SECRET

    if (!paypalClientId || !paypalSecret) {
      console.error("PayPal credentials not configured")
      // CRITICAL — only fires when env vars are missing in production.
      // Heavily dedup'd because if it fires once it'll fire on every checkout.
      if (process.env.NODE_ENV === "production") {
        await alertAdmin({
          severity: "critical",
          subject: "PayPal checkout: credentials missing in production",
          body:
            "PAYPAL_CLIENT_ID or PAYPAL_SECRET is missing — every PayPal checkout " +
            "attempt will fail until both are restored in Vercel env vars.",
          dedupKey: "paypal:checkout-no-credentials",
        })
      }
      return NextResponse.json({ error: "Payment system not configured. Please contact support." }, { status: 503 })
    }

    // Get PayPal access token
    const auth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString("base64")
    const tokenResponse = await fetch(
      `${process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com"}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    )

    if (!tokenResponse.ok) {
      console.error("Failed to get PayPal access token, status:", tokenResponse.status)
      // ERROR — could be PayPal outage, credential drift, or quota.
      // Dedup'd so a transient PayPal blip doesn't email every retry.
      await alertAdmin({
        severity: "error",
        subject: "PayPal checkout: token request failed",
        body:
          "PayPal OAuth token request failed. New checkouts cannot proceed " +
          "until this is resolved. Could be a PayPal outage, expired/invalid " +
          "credentials, or rate-limit.",
        details: { status: tokenResponse.status },
        dedupKey: "paypal:checkout-token-failed",
      })
      return NextResponse.json({ error: "PayPal authentication failed" }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    // Create PayPal order
    const orderResponse = await fetch(
      `${process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com"}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              // Description shows as the order summary on PayPal's pre-pay screen
              // (60-char limit; we keep it human-readable).
              description: `${book.title} — Ebook`.slice(0, 127),
              // custom_id flows through to the webhook so we know which book
              // got paid for. Kept simple (just the bookId).
              custom_id: String(bookId),
              // items[] surfaces a proper itemized line on PayPal's UI so the
              // customer clearly sees what they're buying. Without this PayPal
              // shows only a generic "Maya Allan" charge with no product.
              items: [
                {
                  name: (book.title || "Ebook").slice(0, 127),
                  description: (book.subtitle1 || "Ebook — instant download after payment").slice(0, 127),
                  quantity: "1",
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: "USD",
                    value: Number(book.ebook_price).toFixed(2),
                  },
                },
              ],
              amount: {
                currency_code: "USD",
                value: Number(book.ebook_price).toFixed(2),
                // PayPal requires breakdown.item_total when items[] is present.
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: Number(book.ebook_price).toFixed(2),
                  },
                },
              },
            },
          ],
          application_context: {
            brand_name: "Maya Allan",
            // Digital goods — skip the shipping-address step entirely.
            shipping_preference: "NO_SHIPPING",
            // Show "Pay Now" (not "Continue") so the customer knows clicking
            // commits the charge.
            user_action: "PAY_NOW",
            // IMPORTANT: PayPal redirects here AFTER the customer approves the
            // order. The order is APPROVED but NOT captured at this point —
            // /api/checkout/paypal/return captures it (calling PayPal's capture
            // endpoint) and then sends the customer to the friendly success
            // page on the book detail route. PayPal appends &token=<orderId>
            // &PayerID=<...> to this URL automatically.
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/checkout/paypal/return?bookSlug=${encodeURIComponent(book.slug)}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/books/${book.slug}?payment=cancelled`,
          },
        }),
      }
    )

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}))
      console.error("Failed to create PayPal order:", errorData)
      // ERROR — PayPal API rejected the order. Likely PayPal-side issue or
      // bad amount/currency. Dedup'd so a single bad book row doesn't spam.
      await alertAdmin({
        severity: "error",
        subject: "PayPal checkout: create-order rejected",
        body:
          "PayPal rejected the create-order request. Customers cannot complete " +
          "a checkout until this is resolved.",
        details: { status: orderResponse.status, bookId, errorName: errorData?.name },
        dedupKey: "paypal:checkout-create-order-failed",
      })
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 })
    }

    const order = await orderResponse.json()

    // Find the approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === "approve")?.href

    if (!approvalUrl) {
      console.error("No approval URL in PayPal order response")
      await alertAdmin({
        severity: "warning",
        subject: "PayPal checkout: response shape changed",
        body:
          "PayPal returned a successful create-order response but no 'approve' link. " +
          "PayPal may have changed their API response shape — investigate.",
        details: { bookId, linksReceived: Array.isArray(order.links) ? order.links.length : 0 },
        dedupKey: "paypal:checkout-no-approval-url",
      })
      return NextResponse.json({ error: "Failed to get PayPal checkout URL" }, { status: 500 })
    }

    return NextResponse.json({ url: approvalUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // User input validation — keep the field-level details for debugging,
      // safe because zod issues describe shape not secrets.
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 })
    }
    console.error("PayPal checkout error:", error)
    await alertAdmin({
      severity: "error",
      subject: "PayPal checkout: handler threw unexpectedly",
      body:
        "The PayPal checkout handler threw an unexpected error. No money has changed " +
        "hands at this stage (payment hasn't been captured yet), but customers cannot " +
        "complete a purchase until this is resolved.",
      details: { errorMessage: (error as any)?.message ?? String(error) },
      dedupKey: "paypal:checkout-handler-threw",
    })
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
