/**
 * POST /api/checkout/paypal — start an ebook direct-sale PayPal checkout.
 *
 * Three manual prerequisites in admin (`/admin/books/<slug>`):
 *   1. `allow_direct_sale` must be TRUE.
 *   2. `ebook_price` must be > 0.
 *   3. `ebook_file_url` must point at the actual ebook PDF/EPUB in Vercel
 *      Blob (use the file-upload widget on the book edit page).
 *
 * Without those, this endpoint correctly refuses the checkout. The webhook
 * (/api/payment/paypal/webhook) handles the rest of the flow: order row,
 * download token, email delivery, alertAdmin on failures.
 *
 * Audiobook is intentionally NOT sold through this endpoint — use Gumroad
 * or another external seller and surface it via the per-format
 * `book_retailer_links` table (admin: Retailer Links section).
 *
 * Security:
 *   - Per-IP rate-limit (15 attempts / 15 min) blocks anonymous order spam.
 *   - The created paypal_order_id is persisted in pending_paypal_orders
 *     so /api/checkout/paypal/return can validate that the returning
 *     ?token=<orderId> is one we actually created — prevents an attacker
 *     from force-capturing another customer's APPROVED order.
 */
import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { alertAdmin } from "@/lib/alert-admin"
import { apiBase, getAccessToken, safePaypalEnvLabel } from "@/lib/paypal"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { createHash } from "node:crypto"
import { z } from "zod"

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

  // Per-IP rate-limit BEFORE we burn a PayPal OAuth token or create an order.
  // 15 attempts per 15 min is generous for real shoppers; anonymous spam hits
  // the lockout quickly.
  const limit = rateLimit({
    scope: "paypal-checkout",
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
      return NextResponse.json({ error: "Book not available for direct sale" }, { status: 400 })
    }

    if (!book.ebook_file_url) {
      return NextResponse.json({ error: "Ebook file not configured. Please contact support." }, { status: 400 })
    }

    // Get a cached PayPal access token via the shared helper.
    let access_token: string
    try {
      access_token = await getAccessToken()
    } catch (err) {
      console.error("PayPal OAuth failed:", err)
      // ERROR — could be PayPal outage, credential drift, or quota.
      await alertAdmin({
        severity: "error",
        subject: "PayPal checkout: token request failed",
        body:
          "PayPal OAuth token request failed. New checkouts cannot proceed " +
          "until this is resolved. Could be a PayPal outage, expired/invalid " +
          "credentials, or rate-limit. Verify PAYPAL_CLIENT_ID / " +
          "PAYPAL_CLIENT_SECRET (or legacy PAYPAL_SECRET) in Vercel env vars.",
        details: { paypalEnv: safePaypalEnvLabel(), errorMessage: err instanceof Error ? err.message : String(err) },
        dedupKey: "paypal:checkout-token-failed",
      })
      return NextResponse.json({ error: "PayPal authentication failed" }, { status: 503 })
    }

    // Create PayPal order
    const orderResponse = await fetch(
      `${apiBase()}/v2/checkout/orders`,
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
              description: `${book.title} — Ebook`.slice(0, 127),
              custom_id: String(bookId),
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
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            // Return URL points at the capture-on-return route which calls
            // /v2/checkout/orders/<id>/capture, then redirects the customer
            // to /books/<slug>?payment=success. PayPal appends &token=<orderId>
            // and &PayerID=<...> automatically.
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/checkout/paypal/return?bookSlug=${encodeURIComponent(book.slug)}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/books/${book.slug}?payment=cancelled`,
          },
        }),
      }
    )

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}))
      console.error("Failed to create PayPal order:", errorData)
      await alertAdmin({
        severity: "error",
        subject: "PayPal checkout: create-order rejected",
        body:
          "PayPal rejected the create-order request. Customers cannot complete " +
          "a checkout until this is resolved.",
        details: { status: orderResponse.status, bookId, paypalEnv: safePaypalEnvLabel(), errorName: (errorData as any)?.name },
        dedupKey: "paypal:checkout-create-order-failed",
      })
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 })
    }

    const order = await orderResponse.json()
    const paypalOrderId: string | undefined = order?.id

    if (!paypalOrderId) {
      console.error("PayPal create-order returned no id")
      await alertAdmin({
        severity: "warning",
        subject: "PayPal checkout: create-order response missing id",
        body:
          "PayPal returned a successful create-order but no `id` field. " +
          "PayPal may have changed their response shape — investigate.",
        details: { bookId, paypalEnv: safePaypalEnvLabel() },
        dedupKey: "paypal:checkout-no-order-id",
      })
      return NextResponse.json({ error: "Failed to get PayPal order id" }, { status: 500 })
    }

    // Persist the pending order so /api/checkout/paypal/return can validate
    // the returning ?token=<orderId> against a row we actually created. The
    // ip_hash + ua_hash are soft signals only (legitimate users can switch
    // networks/devices between create-order and approve-order); the hard
    // gate is status='pending' on a row keyed by paypal_order_id.
    const { error: pendingInsertError } = await supabaseAdmin
      .from("pending_paypal_orders")
      .insert({
        paypal_order_id: paypalOrderId,
        book_id: bookId,
        book_slug: book.slug,
        ip_hash: hashForBinding(ip),
        user_agent_hash: hashForBinding(request.headers.get("user-agent")),
        status: "pending",
      })

    if (pendingInsertError) {
      // The order is created on PayPal's side regardless. We log + alert and
      // still send the customer to PayPal — if they pay, the return route
      // will refuse to capture for an unknown order. Better to fail closed
      // than to silently let the capture happen without our pending-order
      // protection.
      console.error("pending_paypal_orders insert failed:", pendingInsertError)
      await alertAdmin({
        severity: "critical",
        subject: "PayPal checkout: pending_paypal_orders INSERT failed",
        body:
          "Failed to record the pending order before redirecting the customer to PayPal. " +
          "If the customer completes payment, the return route will refuse to capture " +
          "(treating the unrecorded ID as unknown) and Maya will need to manually capture " +
          "from the PayPal dashboard. Investigate the supabase error below.",
        details: { paypalOrderId, bookId, errorCode: pendingInsertError.code },
        dedupKey: `paypal:pending-insert-failed:${paypalOrderId}`,
      })
      return NextResponse.json({ error: "Checkout temporarily unavailable. Please try again." }, { status: 503 })
    }

    // Find the approval URL
    const approvalUrl = (order.links as Array<{ rel: string; href: string }> | undefined)
      ?.find((link) => link.rel === "approve" || link.rel === "payer-action")?.href

    if (!approvalUrl) {
      console.error("No approval URL in PayPal order response")
      await alertAdmin({
        severity: "warning",
        subject: "PayPal checkout: response shape changed (no approve link)",
        body:
          "PayPal returned a successful create-order response but no 'approve' / " +
          "'payer-action' link. PayPal may have changed their API response shape.",
        details: { bookId, paypalOrderId, linksReceived: Array.isArray(order.links) ? order.links.length : 0 },
        dedupKey: "paypal:checkout-no-approval-url",
      })
      return NextResponse.json({ error: "Failed to get PayPal checkout URL" }, { status: 500 })
    }

    return NextResponse.json({ url: approvalUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 })
    }
    console.error("PayPal checkout error:", error)
    await alertAdmin({
      severity: "error",
      subject: "PayPal checkout: handler threw unexpectedly",
      body:
        "The PayPal checkout handler threw an unexpected error. No money has " +
        "changed hands at this stage (payment hasn't been captured yet), but " +
        "customers cannot complete a purchase until this is resolved.",
      details: { errorMessage: (error as any)?.message ?? String(error) },
      dedupKey: "paypal:checkout-handler-threw",
    })
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
