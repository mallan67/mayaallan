import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

/**
 * STRIPE WEBHOOK
 *
 * Responsibilities:
 *  - Verify stripe webhook signature
 *  - Handle checkout.session.completed and payment_intent.succeeded
 *  - On checkout completion: create Order, create DownloadToken (ebook), log and optionally email
 *
 * Required environment variables (set these in Vercel -> Project -> Settings -> Environment Variables):
 *  - STRIPE_SECRET_KEY
 *  - STRIPE_WEBHOOK_SECRET
 *
 * Testing:
 *  - Use the Stripe CLI to forward events during local development:
 *      stripe listen --forward-to https://<your-deploy>.vercel.app/api/webhooks/stripe
 *    or for local testing:
 *      stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
 *
 *  - Trigger a checkout.session.completed test event or create a test Checkout session with metadata:
 *      metadata: { bookId: "<id>", formatType: "ebook" }
 */

// Force Node runtime so the official Stripe Node SDK works consistently
export const runtime = "nodejs"

// Validate env keys early
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!stripeSecretKey) {
  // We log here — runtime will still start, but POST will return an error if missing.
  console.error("Missing STRIPE_SECRET_KEY environment variable")
}
if (!webhookSecret) {
  console.error("Missing STRIPE_WEBHOOK_SECRET environment variable")
}

// Use the Stripe client matching your installed types
const stripe = new Stripe(stripeSecretKey || "", {
  // Standard Stripe API version (using type assertion for stable version)
  apiVersion: "2024-12-18.acacia" as any,
})

export async function POST(request: Request) {
  // Ensure webhook secret is configured
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const rawBody = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    console.warn("Stripe webhook call missing signature header")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // verify signature & parse event
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message ?? err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case "payment_intent.succeeded": {
        // Alternative: handle payment_intent if you are not using Checkout
        console.log("PaymentIntent succeeded event received:", (event.data.object as any).id)
        break
      }

      default:
        console.log(`Unhandled stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    // Protect the webhook from crashing and return 200 so Stripe doesn't retry uncontrollably.
    // You may choose to return 500 to force Stripe retries on severe errors.
    console.error("Error handling webhook event:", err)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

/**
 * handleCheckoutComplete
 *
 * Expected: when creating a Checkout Session, attach metadata { bookId, formatType } and let Stripe complete the payment.
 * This function is resilient to missing data and logs errors instead of throwing.
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    const bookIdRaw = session.metadata?.bookId
    const formatType = (session.metadata?.formatType as string) || "ebook"
    const email = (session.customer_email as string) || (session.customer_details?.email as string | undefined)

    if (!bookIdRaw || !email) {
      console.error("Missing bookId or email in session metadata", { bookIdRaw, email })
      return
    }

    const bookId = parseInt(String(bookIdRaw), 10)
    if (Number.isNaN(bookId)) {
      console.error("Invalid bookId in session metadata", { bookIdRaw })
      return
    }

    // Idempotency: check if order already exists by stripeSessionId
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    })

    if (existingOrder) {
      console.log("Order already processed:", existingOrder.id)
      return
    }

    // Resolve book
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) {
      console.error("Book not found for checkout:", bookId)
      return
    }

    // Build payment fields
    const stripePaymentId = session.payment_intent ? String(session.payment_intent) : null
    const amount = session.amount_total ? Number(session.amount_total) / 100 : 0
    const currency = (session.currency as string | undefined) || "usd"

    // Create order
    const order = await prisma.order.create({
      data: {
        email,
        customerName: session.customer_details?.name || null,
        stripeSessionId: session.id,
        stripePaymentId,
        bookId,
        formatType,
        amount,
        currency,
        status: "completed",
        completedAt: new Date(),
      },
    })

    console.log("Order created:", order.id)

    // Create download token for ebooks
    if (formatType === "ebook" && book.ebookFileUrl) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // valid for 30 days

      const downloadToken = await prisma.downloadToken.create({
        data: {
          orderId: order.id,
          bookId,
          maxDownloads: 5,
          expiresAt,
        },
      })

      console.log("Download token created:", downloadToken.token)

      // TODO: Send email with the download link:
      // const downloadUrl = `https://www.mayaallan.com/download/${downloadToken.token}`
      // await sendEmail({ to: email, subject: `Your ebook: ${book.title}`, html: `...` })
    }
  } catch (error) {
    console.error("Error in handleCheckoutComplete:", error)
  }
}
