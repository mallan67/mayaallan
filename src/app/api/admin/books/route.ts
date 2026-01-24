export const runtime = "nodejs";
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

function toDecimalOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value !== "string") return null
  const cleaned = value.trim().replace(/[$,]/g, "")
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { data: books, error } = await supabaseAdmin
      .from(Tables.books)
      .select(`
        *,
        book_retailer_links (
          *,
          retailer:retailers (*)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Map to camelCase for frontend compatibility
    const mappedBooks = (books || []).map((book) => ({
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle1: book.subtitle1,
      subtitle2: book.subtitle2,
      subtitle3: book.subtitle3,
      tagsCsv: book.tags_csv,
      isbn: book.isbn,
      copyright: book.copyright,
      blurb: book.blurb,
      coverUrl: book.cover_url,
      backCoverUrl: book.back_cover_url,
      ebookFileUrl: book.ebook_file_url,
      hasEbook: book.has_ebook,
      hasPaperback: book.has_paperback,
      hasHardcover: book.has_hardcover,
      ebookPrice: book.ebook_price,
      paperbackPrice: book.paperback_price,
      hardcoverPrice: book.hardcover_price,
      isFeatured: book.is_featured,
      isPublished: book.is_published,
      isVisible: book.is_visible,
      isComingSoon: book.is_coming_soon,
      allowDirectSale: book.allow_direct_sale,
      allowRetailerSale: book.allow_retailer_sale,
      stripePaymentLink: book.stripe_payment_link,
      paypalPaymentLink: book.paypal_payment_link,
      seoTitle: book.seo_title,
      seoDescription: book.seo_description,
      ogImageUrl: book.og_image_url,
      publishedAt: book.published_at,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
      retailers: (book.book_retailer_links || []).map((link: any) => ({
        id: link.id,
        bookId: link.book_id,
        retailerId: link.retailer_id,
        url: link.url,
        formatType: link.format_type,
        isActive: link.is_active,
        retailer: link.retailer ? {
          id: link.retailer.id,
          name: link.retailer.name,
          slug: link.retailer.slug,
          iconUrl: link.retailer.icon_url,
          isActive: link.retailer.is_active,
        } : null,
      })),
    }))

    return NextResponse.json(mappedBooks)
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Step 1: Check authentication
  let authed: boolean
  try {
    authed = await isAuthenticated()
  } catch (authError: any) {
    console.error("Auth check failed:", authError)
    return NextResponse.json({ error: "Auth check failed", details: authError?.message }, { status: 500 })
  }

  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Step 2: Parse request body
  let body: any
  try {
    body = await request.json()
    console.log("Creating book with payload:", { title: body.title, slug: body.slug })
  } catch (parseError: any) {
    console.error("Body parse failed:", parseError)
    return NextResponse.json({ error: "Invalid JSON body", details: parseError?.message }, { status: 400 })
  }

  // Step 3: Insert into database
  try {
    // Verify Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase env vars:", {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      return NextResponse.json({ error: "Server config error: Missing database credentials" }, { status: 500 })
    }

    const data = {
      slug: body.slug || "",
      title: body.title || "",
      subtitle1: body.subtitle1 || null,
      subtitle2: body.subtitle2 || null,
      subtitle3: body.subtitle3 || null,
      tags_csv: body.tagsCsv || null,
      isbn: body.isbn || null,
      copyright: body.copyright || null,
      blurb: body.blurb || null,
      cover_url: body.coverUrl || null,
      back_cover_url: body.backCoverUrl || null,
      ebook_file_url: body.ebookFileUrl || null,
      has_ebook: Boolean(body.hasEbook),
      has_paperback: Boolean(body.hasPaperback),
      has_hardcover: Boolean(body.hasHardcover),
      ebook_price: toDecimalOrNull(body.ebookPrice),
      paperback_price: toDecimalOrNull(body.paperbackPrice),
      hardcover_price: toDecimalOrNull(body.hardcoverPrice),
      is_featured: Boolean(body.isFeatured),
      is_published: Boolean(body.isPublished),
      is_visible: Boolean(body.isVisible),
      is_coming_soon: Boolean(body.isComingSoon),
      allow_direct_sale: Boolean(body.allowDirectSale),
      allow_retailer_sale: Boolean(body.allowRetailerSale),
      stripe_payment_link: body.stripePaymentLink || null,
      paypal_payment_link: body.paypalPaymentLink || null,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      og_image_url: body.ogImageUrl || null,
      published_at: body.publishedAt ? new Date(body.publishedAt).toISOString() : null,
    }

    const { data: book, error } = await supabaseAdmin
      .from(Tables.books)
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", { code: error.code, message: error.message, details: error.details, hint: error.hint })
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
      }
      return NextResponse.json({
        error: error.message || "Database insert failed",
        details: error.details || null,
        hint: error.hint || null,
        code: error.code
      }, { status: 500 })
    }

    // Map to camelCase for frontend compatibility
    const mappedBook = {
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle1: book.subtitle1,
      subtitle2: book.subtitle2,
      subtitle3: book.subtitle3,
      tagsCsv: book.tags_csv,
      isbn: book.isbn,
      copyright: book.copyright,
      blurb: book.blurb,
      coverUrl: book.cover_url,
      backCoverUrl: book.back_cover_url,
      ebookFileUrl: book.ebook_file_url,
      hasEbook: book.has_ebook,
      hasPaperback: book.has_paperback,
      hasHardcover: book.has_hardcover,
      ebookPrice: book.ebook_price,
      paperbackPrice: book.paperback_price,
      hardcoverPrice: book.hardcover_price,
      isFeatured: book.is_featured,
      isPublished: book.is_published,
      isVisible: book.is_visible,
      isComingSoon: book.is_coming_soon,
      allowDirectSale: book.allow_direct_sale,
      allowRetailerSale: book.allow_retailer_sale,
      stripePaymentLink: book.stripe_payment_link,
      paypalPaymentLink: book.paypal_payment_link,
      seoTitle: book.seo_title,
      seoDescription: book.seo_description,
      ogImageUrl: book.og_image_url,
      publishedAt: book.published_at,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
    }

    // Revalidate public pages so changes appear immediately
    revalidatePath("/books")
    revalidatePath("/")

    return NextResponse.json(mappedBook, { status: 201 })
  } catch (error: any) {
    console.error("Error creating book:", error)
    // Return more detailed error info for debugging
    const errorMessage = error?.message || error?.code || "Failed to create book"
    const errorDetails = error?.details || error?.hint || null
    return NextResponse.json({
      error: errorMessage,
      details: errorDetails,
      code: error?.code
    }, { status: 500 })
  }
}
