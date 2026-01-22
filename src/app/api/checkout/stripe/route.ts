import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { z } from "zod"

const checkoutSchema = z.object({
  bookId: z.number().int().positive(),
  email: z.string().email().optional(),
})

export async function POST(request: Request) {
  // Check for required environment variable
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY environment variable")
    return NextResponse.json({
      error: "Payment system not configured. Please contact support."
    }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { bookId, email } = checkoutSchema.parse(body)

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

    // Initialize Stripe (lazy load to avoid build-time issues)
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

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
      // After successful payment, redirect to a thank-you page
      // The download link will be sent via email after webhook confirms payment
      success_url: `${siteUrl}/books/${book.slug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/books/${book.slug}?payment=cancelled`,
      metadata: {
        bookId: String(bookId),
        bookSlug: book.slug,
        bookTitle: book.title,
      },
      customer_email: email || undefined, // Pre-fill if provided
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
