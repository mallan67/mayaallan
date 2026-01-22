import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * RETAILER LINKS API (Issue #4 Fix):
 *
 * This endpoint:
 * 1. Accepts free-text retailer names from the admin form
 * 2. Auto-creates Retailer records if they don't exist
 * 3. Creates BookRetailerLink records with proper foreign keys
 * 4. Handles the unique constraint (bookId, retailerId, formatType)
 * 5. Returns properly formatted data for the frontend
 *
 * PUT: Replace all links for a book
 * GET: Get all links for a book
 */

interface RetailerLinkInput {
  id?: number
  formatType: string
  retailerName: string
  url: string
}

// PUT - Replace all retailer links for a book
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const links: RetailerLinkInput[] = body.links || []

    console.log(`Processing ${links.length} retailer links for book ${bookId}`)

    // Verify book exists
    const { data: book, error: bookError } = await supabaseAdmin
      .from(Tables.books)
      .select("id")
      .eq("id", bookId)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Delete existing links
    const { count: deleted } = await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .delete()
      .eq("book_id", bookId)

    console.log(`Deleted ${deleted || 0} existing links`)

    // Process each new link
    const createdLinks: any[] = []
    const errors: string[] = []

    for (const link of links) {
      // Skip empty retailer names
      if (!link.retailerName || link.retailerName.trim() === "") {
        continue
      }

      const retailerName = link.retailerName.trim()
      const retailerSlug = retailerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      try {
        // Find or create retailer
        let { data: retailer, error: findError } = await supabaseAdmin
          .from(Tables.retailers)
          .select("*")
          .or(`slug.eq.${retailerSlug},name.ilike.${retailerName}`)
          .limit(1)
          .single()

        if (findError || !retailer) {
          // Create new retailer
          const { data: newRetailer, error: createError } = await supabaseAdmin
            .from(Tables.retailers)
            .insert({
              name: retailerName,
              slug: retailerSlug,
              is_active: true,
            })
            .select()
            .single()

          if (createError) throw createError
          retailer = newRetailer
          console.log(`Created new retailer: ${retailerName} (id: ${retailer.id})`)
        } else if (!retailer.name || retailer.name.trim() === "") {
          // Fix retailer with empty name
          const { data: updated, error: updateError } = await supabaseAdmin
            .from(Tables.retailers)
            .update({ name: retailerName, slug: retailerSlug })
            .eq("id", retailer.id)
            .select()
            .single()

          if (updateError) throw updateError
          retailer = updated
          console.log(`Fixed retailer name: ${retailerName} (id: ${retailer.id})`)
        }

        // Create the book-retailer link
        const { data: newLink, error: linkError } = await supabaseAdmin
          .from(Tables.bookRetailerLinks)
          .insert({
            book_id: bookId,
            retailer_id: retailer.id,
            url: link.url || "",
            format_type: link.formatType || "ebook",
            is_active: true,
          })
          .select(`
            *,
            retailer:retailers (*)
          `)
          .single()

        if (linkError) throw linkError

        createdLinks.push({
          id: newLink.id,
          formatType: newLink.format_type,
          retailerName: newLink.retailer?.name || retailerName,
          url: newLink.url,
        })

        console.log(`Created link: ${retailerName} - ${link.formatType}`)

      } catch (linkError: any) {
        // Handle unique constraint violation
        if (linkError?.code === "23505") {
          errors.push(`Duplicate: ${retailerName} - ${link.formatType}`)
          console.warn(`Skipped duplicate: ${retailerName} - ${link.formatType}`)
        } else {
          throw linkError
        }
      }
    }

    return NextResponse.json({
      success: true,
      created: createdLinks.length,
      links: createdLinks,
      warnings: errors.length > 0 ? errors : undefined,
    })

  } catch (error: any) {
    console.error("Error saving retailer links:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save retailer links" },
      { status: 500 }
    )
  }
}

// GET - Get all retailer links for a book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const { data: links, error } = await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .select(`
        *,
        retailer:retailers (*)
      `)
      .eq("book_id", bookId)
      .order("format_type", { ascending: true })

    if (error) throw error

    // Format for frontend
    const formatted = (links || []).map((link) => ({
      id: link.id,
      formatType: link.format_type,
      retailerName: link.retailer?.name || "",
      url: link.url,
    }))

    return NextResponse.json(formatted)

  } catch (error) {
    console.error("Error fetching retailer links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}
