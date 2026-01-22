import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
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
      return NextResponse.json({ error: "Book not available for direct sale" }, { status: 400 })
    }

    if (!book.ebook_file_url) {
      return NextResponse.json({ error: "Ebook file not configured. Please contact support." }, { status: 400 })
    }

    // For PayPal, we need to create an order via the PayPal API
    // This requires the PayPal SDK
    const paypalClientId = process.env.PAYPAL_CLIENT_ID
    const paypalSecret = process.env.PAYPAL_SECRET

    if (!paypalClientId || !paypalSecret) {
      console.error("PayPal credentials not configured")
      return NextResponse.json({ error: "PayPal not configured" }, { status: 500 })
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
      console.error("Failed to get PayPal access token")
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
              description: book.title,
              custom_id: String(bookId), // Pass bookId in custom_id
              amount: {
                currency_code: "USD",
                value: Number(book.ebook_price).toFixed(2),
              },
            },
          ],
          application_context: {
            brand_name: "Maya Allan",
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/books/${book.slug}?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/books/${book.slug}?payment=cancelled`,
          },
        }),
      }
    )

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error("Failed to create PayPal order:", errorData)
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 })
    }

    const order = await orderResponse.json()

    // Find the approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === "approve")?.href

    if (!approvalUrl) {
      console.error("No approval URL in PayPal order response")
      return NextResponse.json({ error: "Failed to get PayPal checkout URL" }, { status: 500 })
    }

    return NextResponse.json({ url: approvalUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 })
    }
    console.error("PayPal checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
