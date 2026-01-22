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

    // Initialize Stripe (lazy load to avoid build-time issues)
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    })

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: book.title,
              description: book.subtitle1 || book.blurb || undefined,
              images: book.cover_url ? [book.cover_url] : undefined,
            },
            unit_amount: Math.round(Number(book.ebook_price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/books/${book.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/books/${book.slug}?payment=cancelled`,
      metadata: {
        bookId: String(bookId),
      },
      customer_email: undefined, // Let Stripe collect email
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 })
    }
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
