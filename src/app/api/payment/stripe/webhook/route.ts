import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getBookBySlug } from "@/lib/mock-data"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  // In production, verify the webhook signature with Stripe
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

  try {
    const event = JSON.parse(body)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      // Extract book slug from metadata
      const bookSlug = session.metadata?.bookSlug
      if (!bookSlug) {
        return NextResponse.json({ error: "No book slug in metadata" }, { status: 400 })
      }

      const book = await getBookBySlug(bookSlug)
      if (!book || !book.ebookFileUrl) {
        return NextResponse.json({ error: "Book or ebook file not found" }, { status: 404 })
      }

      // TODO: Send email to customer with ebook download link
      // The ebook download link would be: book.ebookFileUrl
      // Email should be sent to: session.customer_email

      console.log("[v0] Stripe payment successful for book:", bookSlug)
      console.log("[v0] Ebook should be delivered to:", session.customer_email)
      console.log("[v0] Ebook URL:", book.ebookFileUrl)

      return NextResponse.json({ received: true, ebookUrl: book.ebookFileUrl })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
