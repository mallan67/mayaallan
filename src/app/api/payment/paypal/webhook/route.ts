import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { Resend } from "resend"
import { alertAdmin } from "@/lib/alert-admin"
import crypto from "crypto"

/**
 * PAYPAL WEBHOOK - Payment completion handler
 *
 * When a PayPal payment succeeds:
 * 1. Verify webhook signature (CRITICAL for security)
 * 2. Create Order record
 * 3. Generate secure DownloadToken (expires in 30 days, 5 max downloads)
 * 4. Send email with download link
 *
 * Required env vars:
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_SECRET (also called PAYPAL_CLIENT_SECRET)
 * - PAYPAL_WEBHOOK_ID (from PayPal Dashboard > Webhooks)
 * - PAYPAL_API_BASE (optional, defaults to sandbox)
 */

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_SECRET
  const apiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com"

  if (!clientId || !clientSecret) {
    console.error("PayPal credentials not configured")
    return null
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    if (!response.ok) {
      console.error("Failed to get PayPal access token:", await response.text())
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("PayPal auth error:", error)
    return null
  }
}

async function verifyPayPalWebhook(
  body: string,
  headersList: Headers
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  const apiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com"

  if (!webhookId) {
    if (process.env.NODE_ENV === "production") {
      console.error("PAYPAL_WEBHOOK_ID required in production — rejecting webhook")
      return false
    }
    console.warn("⚠️ PAYPAL_WEBHOOK_ID not set — skipping verification (dev only)")
    return true
  }

  const accessToken = await getPayPalAccessToken()
  if (!accessToken) {
    return false
  }

  try {
    // Get required headers from PayPal webhook request
    const transmissionId = headersList.get("paypal-transmission-id")
    const transmissionTime = headersList.get("paypal-transmission-time")
    const certUrl = headersList.get("paypal-cert-url")
    const transmissionSig = headersList.get("paypal-transmission-sig")
    const authAlgo = headersList.get("paypal-auth-algo")

    if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig || !authAlgo) {
      console.error("Missing PayPal webhook headers")
      return false
    }

    // Verify with PayPal API
    const verifyResponse = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    })

    if (!verifyResponse.ok) {
      console.error("PayPal verification request failed:", await verifyResponse.text())
      return false
    }

    const verifyData = await verifyResponse.json()
    return verifyData.verification_status === "SUCCESS"
  } catch (error) {
    console.error("PayPal webhook verification error:", error)
    return false
  }
}

/**
 * Send purchase confirmation email with download link via Resend.
 * Returns { ok: true } or { ok: false, error: string } — never throws.
 */
async function sendPurchaseEmail(args: {
  customerEmail: string
  customerName: string | null
  bookTitle: string
  downloadUrl: string
  expiresAt: Date
  maxDownloads: number
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }

  const resend = new Resend(resendKey)
  const greeting = args.customerName ? `Hi ${args.customerName.split(" ")[0]}` : "Hi"
  const expiryStr = args.expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const escape = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!))

  try {
    const { data, error } = await resend.emails.send({
      from: "Maya Allan <maya@mayaallan.com>",
      to: args.customerEmail,
      subject: `Your purchase from mayaallan.com — ${args.bookTitle}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; line-height: 1.55; color: #14110d;">
          <p>${escape(greeting)},</p>
          <p>Thank you for your purchase. Your download link for <strong>${escape(args.bookTitle)}</strong> is below.</p>
          <p style="margin: 32px 0;">
            <a href="${args.downloadUrl}"
               style="display: inline-block; padding: 14px 32px; background: #0A0A0D; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">
              Download ${escape(args.bookTitle)}
            </a>
          </p>
          <p style="font-size: 13px; color: #6B665E;">
            This link is valid for up to <strong>${args.maxDownloads} downloads</strong> and expires on <strong>${expiryStr}</strong>.
          </p>
          <p style="font-size: 13px; color: #6B665E;">
            Trouble downloading? Reply to this email and I'll send a fresh link.
          </p>
          <p style="margin-top: 32px;">With care,<br/>Maya</p>
        </div>
      `,
    })
    if (error) {
      return { ok: false, error: error.message ?? String(error) }
    }
    return { ok: true, id: data?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}

export async function POST(request: Request) {
  const bodyText = await request.text()
  const headersList = await headers()

  // Verify webhook signature in production
  const isVerified = await verifyPayPalWebhook(bodyText, headersList)
  if (!isVerified) {
    console.error("PayPal webhook verification failed")
    // Dedup heavily — bots probe webhook endpoints constantly; we want one
    // alert per hour at most, not one per probe.
    await alertAdmin({
      severity: "critical",
      subject: "PayPal webhook signature verification failed",
      body:
        "An incoming PayPal webhook failed signature verification. Either an attacker is probing the endpoint, or PAYPAL_WEBHOOK_ID / PAYPAL_SECRET / PAYPAL_CLIENT_ID is misconfigured. " +
        "Check Vercel logs for the source IP and frequency.",
      dedupKey: "paypal:signature-failure",
    })
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  try {
    const body = JSON.parse(bodyText)

    // Handle both legacy (PAYMENT.SALE.COMPLETED) and modern (PAYMENT.CAPTURE.COMPLETED) events
    const isPaymentComplete =
      body.event_type === "PAYMENT.SALE.COMPLETED" ||
      body.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      body.event_type === "CHECKOUT.ORDER.COMPLETED"

    if (isPaymentComplete) {
      const resource = body.resource
      console.log("PayPal webhook event:", body.event_type)

      // Extract book ID from custom_id (modern) or custom (legacy)
      let bookId: number | null = null
      let customerEmail: string | null = null
      let customerName: string | null = null
      let paypalOrderId: string | null = null
      let amount: number = 0
      let currency: string = "usd"

      if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        // Modern checkout flow - capture completed
        bookId = resource.custom_id ? parseInt(resource.custom_id) : null
        paypalOrderId = resource.id
        amount = parseFloat(resource.amount?.value || "0")
        currency = resource.amount?.currency_code?.toLowerCase() || "usd"
        // Note: payer info may be in supplementary_data for captures
        customerEmail = resource.payer?.email_address || resource.supplementary_data?.payer?.email_address
        customerName = resource.payer?.name?.given_name
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname || ""}`.trim()
          : null
      } else if (body.event_type === "CHECKOUT.ORDER.COMPLETED") {
        // Checkout order completed
        const purchaseUnit = resource.purchase_units?.[0]
        bookId = purchaseUnit?.custom_id ? parseInt(purchaseUnit.custom_id) : null
        paypalOrderId = resource.id
        amount = parseFloat(purchaseUnit?.amount?.value || "0")
        currency = purchaseUnit?.amount?.currency_code?.toLowerCase() || "usd"
        customerEmail = resource.payer?.email_address
        customerName = resource.payer?.name?.given_name
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname || ""}`.trim()
          : null
      } else {
        // Legacy PAYMENT.SALE.COMPLETED
        bookId = resource.custom ? parseInt(resource.custom) : null
        paypalOrderId = resource.id
        amount = parseFloat(resource.amount?.total || "0")
        currency = resource.amount?.currency?.toLowerCase() || "usd"
        customerEmail = resource.payer?.email_address
        customerName = resource.payer?.name?.given_name && resource.payer?.name?.surname
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`
          : null
      }

      if (!bookId) {
        console.error("No book ID in PayPal webhook:", body.event_type)
        return NextResponse.json({ error: "No book ID in payment data" }, { status: 400 })
      }

      // Get book from database
      const { data: book, error: bookError } = await supabaseAdmin
        .from(Tables.books)
        .select("*")
        .eq("id", bookId)
        .single()

      if (bookError || !book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }

      if (!customerEmail) {
        console.error("No customer email in PayPal webhook")
        return NextResponse.json({ error: "No customer email" }, { status: 400 })
      }

      // ----------------------------------------------------------------
      // IDEMPOTENCY — pre-check for an existing order with this paypal_order_id.
      // PayPal retries webhooks up to 25× over 3 days on any 5xx or slow ACK,
      // so the SAME webhook payload arriving twice is a normal-operations event,
      // not an edge case. Without this guard the customer gets two emails and
      // two download tokens for one purchase.
      //
      // Three paths fall out of the pre-check:
      //   1. No existing order → INSERT (backstopped by uq_orders_paypal_order_id)
      //   2. Order exists AND token exists → fully fulfilled; dedup and return
      //   3. Order exists but NO token → previous webhook crashed mid-flight;
      //      resume fulfillment using the existing order row
      // ----------------------------------------------------------------
      let order: any
      let resumingExistingOrder = false

      const { data: existingOrder } = await supabaseAdmin
        .from(Tables.orders)
        .select("*")
        .eq("paypal_order_id", paypalOrderId)
        .maybeSingle()

      if (existingOrder) {
        const { data: existingToken } = await supabaseAdmin
          .from(Tables.downloadTokens)
          .select("id")
          .eq("order_id", existingOrder.id)
          .maybeSingle()

        if (existingToken) {
          // Identical retry — already fully fulfilled. Don't re-email the
          // customer; don't mint a new token; just 200 PayPal so they stop retrying.
          return NextResponse.json({
            received: true,
            deduplicated: true,
            orderId: existingOrder.id,
          })
        }

        // Order row exists but token never made it — resume from where the
        // previous attempt failed. Re-using existingOrder avoids creating a
        // duplicate order row in this race.
        resumingExistingOrder = true
        order = existingOrder
      } else {
        const { data: insertedOrder, error: orderError } = await supabaseAdmin
          .from(Tables.orders)
          .insert({
            email: customerEmail,
            customer_name: customerName || null,
            paypal_order_id: paypalOrderId,
            book_id: book.id,
            format_type: "ebook", // Direct sales are ebook-only — see /api/checkout/paypal
            amount: amount,
            currency: currency,
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (orderError || !insertedOrder) {
          // 23505 = postgres unique_violation. Means a concurrent webhook just
          // inserted the same paypal_order_id between our pre-check and our
          // INSERT. Re-select and let the dedup path handle it.
          if (orderError?.code === "23505") {
            const { data: racedOrder } = await supabaseAdmin
              .from(Tables.orders)
              .select("*")
              .eq("paypal_order_id", paypalOrderId)
              .maybeSingle()
            if (racedOrder) {
              return NextResponse.json({
                received: true,
                deduplicated: true,
                raced: true,
                orderId: racedOrder.id,
              })
            }
          }

          console.error("Failed to create order:", orderError)
          // CRITICAL — customer money captured by PayPal, but we have no order row.
          await alertAdmin({
            severity: "critical",
            subject: "PayPal: payment received but order INSERT failed",
            body:
              `A PayPal payment came in but writing the order row to Supabase failed. ` +
              `PayPal will retry the webhook automatically; if retries don't succeed, ` +
              `the payment is in PayPal with no order record on our side. Reconcile manually.`,
            details: {
              paypalOrderId,
              bookId,
              customerEmail,
              amount,
              currency,
              errorCode: orderError?.code,
            },
            dedupKey: `paypal:order-insert-failed:${paypalOrderId}`,
          })
          return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
        }

        order = insertedOrder
      }

      if (resumingExistingOrder) {
        // Worth a warning-level alert — this means an earlier webhook attempt
        // crashed somewhere between order INSERT and token creation. Once is
        // forgivable; if it recurs, something is wrong with token creation
        // or email delivery.
        await alertAdmin({
          severity: "warning",
          subject: "PayPal webhook: resuming previously-failed fulfillment",
          body:
            "An order row already existed for this PayPal order but no download " +
            "token was created — the previous webhook attempt crashed mid-flight. " +
            "Resuming token creation + email delivery now.",
          details: { orderId: order.id, paypalOrderId, customerEmail },
          dedupKey: `paypal:resume-fulfillment:${paypalOrderId}`,
        })
      }

      // Generate download token if ebook file exists
      if (book.ebook_file_url) {
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const { data: downloadToken, error: tokenError } = await supabaseAdmin
          .from(Tables.downloadTokens)
          .insert({
            token,
            order_id: order.id,
            book_id: book.id,
            max_downloads: 5,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single()

        if (tokenError || !downloadToken) {
          // Customer paid but we cannot give them the file. Alert + surface as 500.
          console.error("Token creation failed for order", order.id, "-", tokenError)
          await alertAdmin({
            severity: "critical",
            subject: "PayPal order completed but token creation FAILED",
            body: `A customer paid but download-token creation failed. Manual fulfillment required.`,
            details: { orderId: order.id, customerEmail, bookTitle: book.title, error: tokenError },
          })
          return NextResponse.json({
            error: "Order completed but download token creation failed. Manual fulfillment required.",
            orderId: order.id,
          }, { status: 500 })
        }

        // NEVER log the token value — anyone with read access to Vercel function
        // logs could otherwise fulfill the download by hitting /download/<token>.
        const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/download/${token}`

        const emailResult = await sendPurchaseEmail({
          customerEmail,
          customerName,
          bookTitle: book.title,
          downloadUrl,
          expiresAt,
          maxDownloads: 5,
        })

        if (!emailResult.ok) {
          // Order + token are valid; only delivery email failed. Don't tell PayPal to retry
          // (the order succeeded), but alert + flag for manual follow-up.
          console.error("Purchase email failed for order", order.id, ":", emailResult.error)
          await alertAdmin({
            severity: "error",
            subject: "PayPal: order completed but delivery email failed",
            body: `Order + token are valid but the buyer never received the download link. Resend the link manually.`,
            details: {
              orderId: order.id,
              customerEmail,
              bookTitle: book.title,
              downloadUrl,
              resendError: emailResult.error,
            },
          })
          return NextResponse.json({
            success: true,
            orderId: order.id,
            warning: `Order completed and token created but delivery email failed (${emailResult.error}). Manual send required.`,
          })
        }

        return NextResponse.json({
          success: true,
          orderId: order.id,
          downloadUrl,
        })
      }

      // No ebook file — just confirm order
      console.warn("Order", order.id, "completed but book", book.id, "has no ebook_file_url — nothing to deliver")
      return NextResponse.json({
        success: true,
        orderId: order.id,
        warning: "No ebook file URL set for this book",
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("PayPal webhook error:", error)
    // Top-level catch — code threw mid-flight after signature passed.
    // The payment may or may not be reflected as an order. Surface for review.
    await alertAdmin({
      severity: "critical",
      subject: "PayPal webhook handler threw an unexpected error",
      body:
        "The PayPal webhook handler threw after signature verification succeeded. " +
        "Customer money may have been captured; order/token may or may not exist. " +
        "Check Vercel function logs immediately and reconcile against PayPal.",
      details: { errorMessage: error?.message ?? String(error) },
      dedupKey: "paypal:handler-threw",
    })
    // Don't leak error.message back over the wire — log server-side only.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
