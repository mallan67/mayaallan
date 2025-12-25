import { NextResponse } from "next/server"
import { getBookBySlug } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In production, verify the webhook with PayPal
    // const verified = await verifyPayPalWebhook(body, headers)

    if (body.event_type === "PAYMENT.SALE.COMPLETED") {
      const sale = body.resource

      // Extract book slug from custom field or invoice
      const bookSlug = sale.custom || sale.invoice_number
      if (!bookSlug) {
        return NextResponse.json({ error: "No book identifier" }, { status: 400 })
      }

      const book = await getBookBySlug(bookSlug)
      if (!book || !book.ebookFileUrl) {
        return NextResponse.json({ error: "Book or ebook file not found" }, { status: 404 })
      }

      // TODO: Send email to customer with ebook download link
      // The ebook download link would be: book.ebookFileUrl
      // Email should be sent to: sale.payer.email_address

      console.log("[v0] PayPal payment successful for book:", bookSlug)
      console.log("[v0] Ebook should be delivered to:", sale.payer.email_address)
      console.log("[v0] Ebook URL:", book.ebookFileUrl)

      return NextResponse.json({ success: true, ebookUrl: book.ebookFileUrl })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
