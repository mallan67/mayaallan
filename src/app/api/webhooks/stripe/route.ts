import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

/**
 * STRIPE WEBHOOK (Issue #3B Fix):
 * 
 * This webhook handles Stripe payment completion and:
 * 1. Creates an Order record
 * 2. Creates a DownloadToken for ebook delivery
 * 3. Sends email with download link (optional - integrate with your email service)
 * 
 * Setup required:
 * 1. Add STRIPE_SECRET_KEY to environment
 * 2. Add STRIPE_WEBHOOK_SECRET to environment
 * 3. Configure Stripe webhook in dashboard to point to /api/webhooks/stripe
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      await handleCheckoutComplete(session)
      break
    }

    case "payment_intent.succeeded": {
      // Alternative: handle payment_intent if not using Checkout
      console.log("Payment succeeded:", event.data.object)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    // Extract metadata (you need to set this when creating the checkout session)
    const bookId = session.metadata?.bookId
    const formatType = session.metadata?.formatType || "ebook"
    const email = session.customer_email || session.customer_details?.email

    if (!bookId || !email) {
      console.error("Missing bookId or email in session metadata")
      return
    }

    // Check if order already exists (idempotency)
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    })

    if (existingOrder) {
      console.log("Order already processed:", existingOrder.id)
      return
    }

    // Get the book
    const book = await prisma.book.findUnique({
      where: { id: parseInt(bookId) },
    })

    if (!book) {
      console.error("Book not found:", bookId)
      return
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        email,
        customerName: session.customer_details?.name || null,
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string,
        bookId: parseInt(bookId),
        formatType,
        amount: (session.amount_total || 0) / 100, // Convert from cents
        currency: session.currency || "usd",
        status: "completed",
        completedAt: new Date(),
      },
    })

    console.log("Order created:", order.id)

    // Create download token (for ebooks only)
    if (formatType === "ebook" && book.ebookFileUrl) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days validity

      const downloadToken = await prisma.downloadToken.create({
        data: {
          orderId: order.id,
          bookId: parseInt(bookId),
          maxDownloads: 5,
          expiresAt,
        },
      })

      console.log("Download token created:", downloadToken.token)

      // TODO: Send email with download link
      // The download link would be: https://yoursite.com/download/[token]
      // 
      // Example with a mail service:
      // await sendEmail({
      //   to: email,
      //   subject: `Your ebook: ${book.title}`,
      //   html: `
      //     <h1>Thank you for your purchase!</h1>
      //     <p>Download your ebook here:</p>
      //     <a href="https://yoursite.com/download/${downloadToken.token}">
      //       Download ${book.title}
      //     </a>
      //     <p>This link is valid for 30 days and can be used up to 5 times.</p>
      //   `
      // })
    }

  } catch (error) {
    console.error("Error processing checkout:", error)
  }
}
