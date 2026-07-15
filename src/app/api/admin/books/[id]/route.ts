import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { bookUpdateSchema, formatZodError } from "@/lib/admin-schemas"

/**
 * BOOK API ROUTE (Issue #3A Fix):
 *
 * This route must properly save ALL book fields including:
 * - allowDirectSale (boolean)
 * - paypalPaymentLink (string)
 * - allowRetailerSale (boolean)
 * - All other book fields
 *
 * The save must be atomic - if any field fails, the whole save fails
 * with a clear error message.
 */

// GET single book by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const [book] = await sql`
      select
        b.*,
        coalesce(
          (
            select json_agg(json_build_object(
              'id', l.id, 'book_id', l.book_id, 'retailer_id', l.retailer_id,
              'url', l.url, 'format_type', l.format_type, 'is_active', l.is_active,
              'retailer', case when r.id is null then null else json_build_object(
                'id', r.id, 'name', r.name, 'slug', r.slug,
                'icon_url', r.icon_url, 'is_active', r.is_active
              ) end
            ))
            from book_retailer_links l
            left join retailers r on r.id = l.retailer_id
            where l.book_id = b.id
          ),
          '[]'::json
        ) as book_retailer_links
      from books b
      where b.id = ${bookId}
      limit 1
    `

    // No row -> 404. (A transient DB error now throws to the catch below and
    // returns 500 rather than the old error-as-404; admin-only, and more
    // correct — a Postgres blip should not read as a missing record.)
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Map to camelCase for frontend
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
    }

    return NextResponse.json(mappedBook)
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 })
  }
}

// PUT update book
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const rawBody = await request.json().catch(() => ({}))
    const parsed = bookUpdateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(formatZodError(parsed.error), { status: 400 })
    }
    const input = parsed.data

    // Verify book exists
    const [existingBook] = await sql`select id from books where id = ${bookId} limit 1`

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Build snake_case update payload from validated camelCase input.
    // Only columns whose camelCase field was present in the request body
    // are written — preserves the "partial update" semantics the admin
    // form depends on. Field-by-field mapping (no Object.entries loop)
    // because the column names diverge from the input names.
    const FIELD_MAP: Record<keyof typeof input, string> = {
      title: "title",
      slug: "slug",
      subtitle1: "subtitle1",
      subtitle2: "subtitle2",
      subtitle3: "subtitle3",
      tagsCsv: "tags_csv",
      isbn: "isbn",
      copyright: "copyright",
      blurb: "blurb",
      coverUrl: "cover_url",
      backCoverUrl: "back_cover_url",
      ebookFileUrl: "ebook_file_url",
      hasEbook: "has_ebook",
      hasPaperback: "has_paperback",
      hasHardcover: "has_hardcover",
      hasAudiobook: "has_audiobook",
      ebookPrice: "ebook_price",
      paperbackPrice: "paperback_price",
      hardcoverPrice: "hardcover_price",
      audiobookPrice: "audiobook_price",
      isFeatured: "is_featured",
      isPublished: "is_published",
      isVisible: "is_visible",
      isComingSoon: "is_coming_soon",
      allowDirectSale: "allow_direct_sale",
      allowRetailerSale: "allow_retailer_sale",
      paypalPaymentLink: "paypal_payment_link",
      seoTitle: "seo_title",
      seoDescription: "seo_description",
      ogImageUrl: "og_image_url",
      publishedAt: "published_at",
    }
    const updateData: Record<string, unknown> = {}
    for (const key of Object.keys(input) as Array<keyof typeof input>) {
      const col = FIELD_MAP[key]
      if (col) updateData[col] = input[key]
    }

    // Perform update, returning the row WITH its retailer-links embed in one
    // round-trip (CTE feeds the json_agg). Was .update().select(embed).single().
    let updatedBook
    try {
      const [row] = await sql`
        with updated as (
          update books set ${sql(updateData)} where id = ${bookId} returning *
        )
        select
          u.*,
          coalesce(
            (
              select json_agg(json_build_object(
                'id', l.id, 'book_id', l.book_id, 'retailer_id', l.retailer_id,
                'url', l.url, 'format_type', l.format_type, 'is_active', l.is_active,
                'retailer', case when r.id is null then null else json_build_object(
                  'id', r.id, 'name', r.name, 'slug', r.slug,
                  'icon_url', r.icon_url, 'is_active', r.is_active
                ) end
              ))
              from book_retailer_links l
              left join retailers r on r.id = l.retailer_id
              where l.book_id = u.id
            ),
            '[]'::json
          ) as book_retailer_links
        from updated u
      `
      updatedBook = row
    } catch (updateErr) {
      if ((updateErr as { code?: string })?.code === "23505") {
        return NextResponse.json(
          { error: "A book with this slug already exists" },
          { status: 409 }
        )
      }
      throw updateErr
    }

    // Map to camelCase for frontend
    const mappedBook = {
      id: updatedBook.id,
      slug: updatedBook.slug,
      title: updatedBook.title,
      subtitle1: updatedBook.subtitle1,
      subtitle2: updatedBook.subtitle2,
      subtitle3: updatedBook.subtitle3,
      tagsCsv: updatedBook.tags_csv,
      isbn: updatedBook.isbn,
      copyright: updatedBook.copyright,
      blurb: updatedBook.blurb,
      coverUrl: updatedBook.cover_url,
      backCoverUrl: updatedBook.back_cover_url,
      ebookFileUrl: updatedBook.ebook_file_url,
      hasEbook: updatedBook.has_ebook,
      hasPaperback: updatedBook.has_paperback,
      hasHardcover: updatedBook.has_hardcover,
      hasAudiobook: updatedBook.has_audiobook ?? false,
      ebookPrice: updatedBook.ebook_price,
      paperbackPrice: updatedBook.paperback_price,
      hardcoverPrice: updatedBook.hardcover_price,
      audiobookPrice: updatedBook.audiobook_price ?? null,
      isFeatured: updatedBook.is_featured,
      isPublished: updatedBook.is_published,
      isVisible: updatedBook.is_visible,
      isComingSoon: updatedBook.is_coming_soon,
      allowDirectSale: updatedBook.allow_direct_sale,
      allowRetailerSale: updatedBook.allow_retailer_sale,
      paypalPaymentLink: updatedBook.paypal_payment_link,
      seoTitle: updatedBook.seo_title,
      seoDescription: updatedBook.seo_description,
      ogImageUrl: updatedBook.og_image_url,
      publishedAt: updatedBook.published_at,
      createdAt: updatedBook.created_at,
      updatedAt: updatedBook.updated_at,
      retailers: (updatedBook.book_retailer_links || []).map((link: any) => ({
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
    }

    // Revalidate public pages so changes appear immediately
    revalidatePath("/books")
    revalidatePath(`/books/${updatedBook.slug}`)
    revalidatePath("/")

    return NextResponse.json(mappedBook)
  } catch (error: any) {
    console.error("Error updating book:", error)
    // Generic client message; full details only in server logs to avoid
    // leaking Supabase column / constraint names.
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    )
  }
}

// DELETE book
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    // Delete retailer links first (the FK is ON DELETE CASCADE, but the
    // original did this explicitly — preserved).
    await sql`delete from book_retailer_links where book_id = ${bookId}`

    // Delete book. A non-existent id deletes 0 rows and returns success — the
    // original's PGRST116->404 branch never fired for a non-single delete, so
    // the observable behavior (success) is preserved.
    await sql`delete from books where id = ${bookId}`

    // Revalidate public pages so changes appear immediately
    revalidatePath("/books")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting book:", error)

    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
  }
}
