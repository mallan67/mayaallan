export const runtime = "nodejs";
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { bookCreateSchema, formatZodError } from "@/lib/admin-schemas"

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
      hasAudiobook: book.has_audiobook ?? false,
      ebookPrice: book.ebook_price,
      paperbackPrice: book.paperback_price,
      hardcoverPrice: book.hardcover_price,
      audiobookPrice: book.audiobook_price ?? null,
      isFeatured: book.is_featured,
      isPublished: book.is_published,
      isVisible: book.is_visible,
      isComingSoon: book.is_coming_soon,
      allowDirectSale: book.allow_direct_sale,
      allowRetailerSale: book.allow_retailer_sale,
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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  // Step 1: Check authentication
  let authed: boolean
  try {
    authed = await isAuthenticated()
  } catch (authError: any) {
    console.error("Auth check failed:", authError)
    return NextResponse.json({ error: "Auth check failed", details: authError?.message }, { status: 500 })
  }

  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Step 2: Parse + validate request body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch (parseError: any) {
    console.error("Body parse failed:", parseError)
    return NextResponse.json({ error: "Invalid JSON body", details: parseError?.message }, { status: 400 })
  }

  const parsed = bookCreateSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(formatZodError(parsed.error), { status: 400 })
  }
  const input = parsed.data

  // Step 3: Insert into database
  try {
    // Verify Supabase is configured
    if (!process.env.SUPABASE_URL || !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      console.error("Missing Supabase env vars:", {
        hasUrl: !!process.env.SUPABASE_URL,
        hasSecret: !!process.env.SUPABASE_SECRET_KEY,
        hasLegacyServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
      return NextResponse.json({ error: "Server config error: Missing database credentials" }, { status: 500 })
    }

    // Map validated camelCase input to the books table's snake_case columns.
    const data = {
      slug: input.slug,
      title: input.title,
      subtitle1: input.subtitle1,
      subtitle2: input.subtitle2,
      subtitle3: input.subtitle3,
      tags_csv: input.tagsCsv,
      isbn: input.isbn,
      copyright: input.copyright,
      blurb: input.blurb,
      cover_url: input.coverUrl,
      back_cover_url: input.backCoverUrl,
      ebook_file_url: input.ebookFileUrl,
      has_ebook: input.hasEbook,
      has_paperback: input.hasPaperback,
      has_hardcover: input.hasHardcover,
      has_audiobook: input.hasAudiobook,
      ebook_price: input.ebookPrice ?? null,
      paperback_price: input.paperbackPrice ?? null,
      hardcover_price: input.hardcoverPrice ?? null,
      audiobook_price: input.audiobookPrice ?? null,
      is_featured: input.isFeatured,
      is_published: input.isPublished,
      is_visible: input.isVisible,
      is_coming_soon: input.isComingSoon,
      allow_direct_sale: input.allowDirectSale,
      allow_retailer_sale: input.allowRetailerSale,
      paypal_payment_link: input.paypalPaymentLink,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      og_image_url: input.ogImageUrl,
      published_at: input.publishedAt,
    }

    const { data: book, error } = await supabaseAdmin
      .from(Tables.books)
      .insert(data)
      .select()
      .single()

    if (error) {
      // Full details stay in server-side logs only — surfacing
      // Supabase column / constraint names to the client leaks schema
      // structure and helps any future attacker reconnaissance.
      console.error("Supabase insert error:", { code: error.code, message: error.message, details: error.details, hint: error.hint })
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 })
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
      hasAudiobook: book.has_audiobook ?? false,
      ebookPrice: book.ebook_price,
      paperbackPrice: book.paperback_price,
      hardcoverPrice: book.hardcover_price,
      audiobookPrice: book.audiobook_price ?? null,
      isFeatured: book.is_featured,
      isPublished: book.is_published,
      isVisible: book.is_visible,
      isComingSoon: book.is_coming_soon,
      allowDirectSale: book.allow_direct_sale,
      allowRetailerSale: book.allow_retailer_sale,
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
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
