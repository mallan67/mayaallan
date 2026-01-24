import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * BOOK API ROUTE (Issue #3A Fix):
 *
 * This route must properly save ALL book fields including:
 * - allowDirectSale (boolean)
 * - stripePaymentLink (string)
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
    const { data: book, error } = await supabaseAdmin
      .from(Tables.books)
      .select(`
        *,
        book_retailer_links (
          *,
          retailer:retailers (*)
        )
      `)
      .eq("id", bookId)
      .single()

    if (error || !book) {
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
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Verify book exists
    const { data: existingBook, error: fetchError } = await supabaseAdmin
      .from(Tables.books)
      .select("id")
      .eq("id", bookId)
      .single()

    if (fetchError || !existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Build update data with explicit type handling
    const updateData: any = {}

    // String fields
    if (body.title !== undefined) updateData.title = String(body.title || "")
    if (body.slug !== undefined) updateData.slug = String(body.slug || "")
    if (body.subtitle1 !== undefined) updateData.subtitle1 = body.subtitle1 || null
    if (body.subtitle2 !== undefined) updateData.subtitle2 = body.subtitle2 || null
    if (body.subtitle3 !== undefined) updateData.subtitle3 = body.subtitle3 || null
    if (body.tagsCsv !== undefined) updateData.tags_csv = body.tagsCsv || null
    if (body.blurb !== undefined) updateData.blurb = body.blurb || null
    if (body.coverUrl !== undefined) updateData.cover_url = body.coverUrl || null
    if (body.backCoverUrl !== undefined) updateData.back_cover_url = body.backCoverUrl || null

    // Debug logging for cover_url
    console.log("Book update - coverUrl received:", body.coverUrl)
    console.log("Book update - cover_url to save:", updateData.cover_url)
    if (body.ebookFileUrl !== undefined) updateData.ebook_file_url = body.ebookFileUrl || null
    if (body.seoTitle !== undefined) updateData.seo_title = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seo_description = body.seoDescription || null

    // Boolean fields - explicit conversion
    if (body.hasEbook !== undefined) updateData.has_ebook = Boolean(body.hasEbook)
    if (body.hasPaperback !== undefined) updateData.has_paperback = Boolean(body.hasPaperback)
    if (body.hasHardcover !== undefined) updateData.has_hardcover = Boolean(body.hasHardcover)
    if (body.isFeatured !== undefined) updateData.is_featured = Boolean(body.isFeatured)
    if (body.isPublished !== undefined) updateData.is_published = Boolean(body.isPublished)
    if (body.isVisible !== undefined) updateData.is_visible = Boolean(body.isVisible)
    if (body.isComingSoon !== undefined) updateData.is_coming_soon = Boolean(body.isComingSoon)

    // CRITICAL: Direct sale fields (Issue #3A)
    if (body.allowDirectSale !== undefined) updateData.allow_direct_sale = Boolean(body.allowDirectSale)
    if (body.allowRetailerSale !== undefined) updateData.allow_retailer_sale = Boolean(body.allowRetailerSale)
    if (body.stripePaymentLink !== undefined) updateData.stripe_payment_link = body.stripePaymentLink || null
    if (body.paypalPaymentLink !== undefined) updateData.paypal_payment_link = body.paypalPaymentLink || null

    // Numeric fields
    if (body.ebookPrice !== undefined) {
      updateData.ebook_price = body.ebookPrice !== null && body.ebookPrice !== ""
        ? parseFloat(body.ebookPrice)
        : null
    }
    if (body.paperbackPrice !== undefined) {
      updateData.paperback_price = body.paperbackPrice !== null && body.paperbackPrice !== ""
        ? parseFloat(body.paperbackPrice)
        : null
    }
    if (body.hardcoverPrice !== undefined) {
      updateData.hardcover_price = body.hardcoverPrice !== null && body.hardcoverPrice !== ""
        ? parseFloat(body.hardcoverPrice)
        : null
    }

    // Debug logging
    console.log("Updating book with data:", {
      id: bookId,
      allowDirectSale: updateData.allow_direct_sale,
      stripePaymentLink: updateData.stripe_payment_link,
      paypalPaymentLink: updateData.paypal_payment_link,
      allowRetailerSale: updateData.allow_retailer_sale,
    })

    // Perform update
    const { data: updatedBook, error: updateError } = await supabaseAdmin
      .from(Tables.books)
      .update(updateData)
      .eq("id", bookId)
      .select(`
        *,
        book_retailer_links (
          *,
          retailer:retailers (*)
        )
      `)
      .single()

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A book with this slug already exists" },
          { status: 409 }
        )
      }
      throw updateError
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
      ebookPrice: updatedBook.ebook_price,
      paperbackPrice: updatedBook.paperback_price,
      hardcoverPrice: updatedBook.hardcover_price,
      isFeatured: updatedBook.is_featured,
      isPublished: updatedBook.is_published,
      isVisible: updatedBook.is_visible,
      isComingSoon: updatedBook.is_coming_soon,
      allowDirectSale: updatedBook.allow_direct_sale,
      allowRetailerSale: updatedBook.allow_retailer_sale,
      stripePaymentLink: updatedBook.stripe_payment_link,
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

    return NextResponse.json(
      { error: error.message || "Failed to update book" },
      { status: 500 }
    )
  }
}

// DELETE book
export async function DELETE(
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
    // Delete retailer links first
    await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .delete()
      .eq("book_id", bookId)

    // Delete book
    const { error } = await supabaseAdmin
      .from(Tables.books)
      .delete()
      .eq("id", bookId)

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }
      throw error
    }

    // Revalidate public pages so changes appear immediately
    revalidatePath("/books")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting book:", error)

    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
  }
}
