import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
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
    console.warn("⚠️ PAYPAL_WEBHOOK_ID not set - skipping verification (dev only)")
    return true // Allow in dev, but log warning
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

export async function POST(request: Request) {
  const bodyText = await request.text()
  const headersList = await headers()

  // Verify webhook signature in production
  const isVerified = await verifyPayPalWebhook(bodyText, headersList)
  if (!isVerified) {
    console.error("PayPal webhook verification failed")
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

      // Create Order record
      const { data: order, error: orderError } = await supabaseAdmin
        .from(Tables.orders)
        .insert({
          email: customerEmail,
          customer_name: customerName || null,
          paypal_order_id: paypalOrderId,
          book_id: book.id,
          format_type: "ebook", // Assume ebook for direct sales
          amount: amount,
          currency: currency,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError || !order) {
        console.error("Failed to create order:", orderError)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
      }

      console.log("Order created:", order.id)

      // Generate download token if ebook file exists
      if (book.ebook_file_url) {
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

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

        if (tokenError) {
          console.error("Failed to create download token:", tokenError)
        } else {
          console.log("Download token created:", downloadToken.token)

          const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/download/${token}`

          // TODO: Send email with download link
          // For now, just log it
          console.log("Email should be sent to:", customerEmail)
          console.log("Download URL:", downloadUrl)
          console.log("Book:", book.title)

          return NextResponse.json({
            success: true,
            orderId: order.id,
            downloadUrl
          })
        }
      }

      // No ebook file - just confirm order
      return NextResponse.json({
        success: true,
        orderId: order.id,
        warning: "No ebook file URL set for this book"
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("PayPal webhook error:", error)
    return NextResponse.json({
      error: "Webhook processing failed",
      details: error.message
    }, { status: 400 })
  }
}
