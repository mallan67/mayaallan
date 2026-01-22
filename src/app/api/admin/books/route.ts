import { NextResponse } from "next/server"
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
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()

    const data = {
      slug: body.slug || "",
      title: body.title || "",
      subtitle1: body.subtitle1 || null,
      subtitle2: body.subtitle2 || null,
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
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json(book, { status: 201 })
  } catch (error: any) {
    console.error("Error creating book:", error)
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
