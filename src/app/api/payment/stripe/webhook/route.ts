import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

/**
 * STRIPE WEBHOOK - Payment completion handler
 *
 * When a Stripe payment succeeds:
 * 1. Create Order record
 * 2. Generate secure DownloadToken (expires in 30 days, 5 max downloads)
 * 3. Send email with download link
 */

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  // TODO: In production, verify the webhook signature with Stripe
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

  try {
    const event = JSON.parse(body)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      // Extract book ID from metadata (we'll need to pass this in payment links)
      const bookId = session.metadata?.bookId ? parseInt(session.metadata.bookId) : null
      if (!bookId) {
        return NextResponse.json({ error: "No book ID in metadata" }, { status: 400 })
      }

      // Get book from database
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      })

      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }

      // Customer info
      const customerEmail = session.customer_email || session.customer_details?.email
      const customerName = session.customer_details?.name

      if (!customerEmail) {
        return NextResponse.json({ error: "No customer email" }, { status: 400 })
      }

      // Create Order record
      const order = await prisma.order.create({
        data: {
          email: customerEmail,
          customerName: customerName || null,
          stripeSessionId: session.id,
          stripePaymentId: session.payment_intent as string,
          bookId: book.id,
          formatType: "ebook", // Assume ebook for direct sales
          amount: session.amount_total / 100, // Convert cents to dollars
          currency: session.currency || "usd",
          status: "completed",
          completedAt: new Date(),
        },
      })

      console.log("✅ Order created:", order.id)

      // Generate download token if ebook file exists
      if (book.ebookFileUrl) {
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

        const downloadToken = await prisma.downloadToken.create({
          data: {
            token,
            orderId: order.id,
            bookId: book.id,
            maxDownloads: 5,
            expiresAt,
          },
        })

        console.log("✅ Download token created:", downloadToken.token)

        const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/download/${token}`

        // TODO: Send email with download link
        // For now, just log it
        console.log("📧 Email should be sent to:", customerEmail)
        console.log("📧 Download URL:", downloadUrl)
        console.log("📧 Book:", book.title)

        // TODO: Implement actual email sending (e.g., with Resend, SendGrid, etc.)
        // await sendEbookDeliveryEmail({
        //   to: customerEmail,
        //   bookTitle: book.title,
        //   downloadUrl,
        //   expiresAt,
        // })

        return NextResponse.json({
          received: true,
          orderId: order.id,
          downloadUrl
        })
      }

      // No ebook file - just confirm order
      return NextResponse.json({
        received: true,
        orderId: order.id,
        warning: "No ebook file URL set for this book"
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("❌ Stripe webhook error:", error)
    return NextResponse.json({
      error: "Webhook processing failed",
      details: error.message
    }, { status: 400 })
  }
}
