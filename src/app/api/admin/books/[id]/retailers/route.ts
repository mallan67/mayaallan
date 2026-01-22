import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * BOOK RETAILERS API (Admin)
 *
 * GET: Returns all BookRetailerLink records for a specific book
 * POST: Creates a new BookRetailerLink using retailerId
 * PUT: Updates an existing BookRetailerLink
 */

// GET - Get all retailer links for a specific book
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
        retailer:retailers (
          id,
          name,
          slug,
          icon_url,
          is_active
        )
      `)
      .eq("book_id", bookId)
      .order("format_type", { ascending: true })

    if (error) throw error

    // Map to camelCase
    const mapped = (links || []).map((link) => ({
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
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Error fetching book retailer links:", error)
    return NextResponse.json(
      { error: "Failed to fetch retailer links" },
      { status: 500 }
    )
  }
}

// POST - Create a new retailer link for a book
export async function POST(
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
    const { retailerId, url, formatType, isActive } = body

    if (!retailerId) {
      return NextResponse.json(
        { error: "retailerId is required" },
        { status: 400 }
      )
    }

    // Verify book exists
    const { data: book, error: bookError } = await supabaseAdmin
      .from(Tables.books)
      .select("id")
      .eq("id", bookId)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Verify retailer exists
    const { data: retailer, error: retailerError } = await supabaseAdmin
      .from(Tables.retailers)
      .select("id")
      .eq("id", parseInt(retailerId))
      .single()

    if (retailerError || !retailer) {
      return NextResponse.json(
        { error: "Retailer not found" },
        { status: 404 }
      )
    }

    // Create the link
    const { data: link, error } = await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .insert({
        book_id: bookId,
        retailer_id: parseInt(retailerId),
        url: url || "",
        format_type: formatType || "ebook",
        is_active: isActive !== undefined ? Boolean(isActive) : true,
      })
      .select(`
        *,
        retailer:retailers (
          id,
          name,
          slug,
          icon_url,
          is_active
        )
      `)
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A link for this retailer and format already exists" },
          { status: 409 }
        )
      }
      throw error
    }

    // Map to camelCase
    const mapped = {
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
    }

    return NextResponse.json(mapped, { status: 201 })
  } catch (error: any) {
    console.error("Error creating retailer link:", error)

    return NextResponse.json(
      { error: "Failed to create retailer link" },
      { status: 500 }
    )
  }
}

// PUT - Update an existing retailer link
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
    const { retailerId, url, formatType, isActive } = body

    if (!retailerId) {
      return NextResponse.json(
        { error: "retailerId is required" },
        { status: 400 }
      )
    }

    // Find the existing link(s) for this retailer
    const { data: existingLinks, error: findError } = await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .select(`*, retailer:retailers (*)`)
      .eq("book_id", bookId)
      .eq("retailer_id", parseInt(retailerId))

    if (findError) throw findError

    if (!existingLinks || existingLinks.length === 0) {
      return NextResponse.json(
        { error: "Retailer link not found" },
        { status: 404 }
      )
    }

    // If there are multiple links for this retailer (different formats),
    // we need to know which one to update. Use formatType to identify it.
    let linkToUpdate = existingLinks[0]
    if (existingLinks.length > 1 && formatType) {
      const matchingLink = existingLinks.find(
        (link) => link.format_type === formatType
      )
      if (matchingLink) {
        linkToUpdate = matchingLink
      }
    }

    // Build update data
    const updateData: any = {}
    if (url !== undefined) updateData.url = url
    if (formatType !== undefined && formatType !== linkToUpdate.format_type) {
      // Check if changing formatType would violate unique constraint
      const { data: conflictCheck } = await supabaseAdmin
        .from(Tables.bookRetailerLinks)
        .select("id")
        .eq("book_id", bookId)
        .eq("retailer_id", parseInt(retailerId))
        .eq("format_type", formatType)
        .neq("id", linkToUpdate.id)
        .limit(1)
        .single()

      if (conflictCheck) {
        return NextResponse.json(
          { error: "A link for this retailer and format already exists" },
          { status: 409 }
        )
      }
      updateData.format_type = formatType
    }
    if (isActive !== undefined) updateData.is_active = Boolean(isActive)

    // Update the link
    const { data: updatedLink, error: updateError } = await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .update(updateData)
      .eq("id", linkToUpdate.id)
      .select(`
        *,
        retailer:retailers (
          id,
          name,
          slug,
          icon_url,
          is_active
        )
      `)
      .single()

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A link for this retailer and format already exists" },
          { status: 409 }
        )
      }
      throw updateError
    }

    // Map to camelCase
    const mapped = {
      id: updatedLink.id,
      bookId: updatedLink.book_id,
      retailerId: updatedLink.retailer_id,
      url: updatedLink.url,
      formatType: updatedLink.format_type,
      isActive: updatedLink.is_active,
      retailer: updatedLink.retailer ? {
        id: updatedLink.retailer.id,
        name: updatedLink.retailer.name,
        slug: updatedLink.retailer.slug,
        iconUrl: updatedLink.retailer.icon_url,
        isActive: updatedLink.retailer.is_active,
      } : null,
    }

    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error("Error updating retailer link:", error)

    return NextResponse.json(
      { error: "Failed to update retailer link" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a retailer link (optional, for completeness)
export async function DELETE(
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
    const { retailerId, formatType } = body

    if (!retailerId) {
      return NextResponse.json(
        { error: "retailerId is required" },
        { status: 400 }
      )
    }

    // Find the link to delete
    let query = supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .select("id")
      .eq("book_id", bookId)
      .eq("retailer_id", parseInt(retailerId))

    if (formatType) {
      query = query.eq("format_type", formatType)
    }

    const { data: link, error: findError } = await query.limit(1).single()

    if (findError || !link) {
      return NextResponse.json(
        { error: "Retailer link not found" },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabaseAdmin
      .from(Tables.bookRetailerLinks)
      .delete()
      .eq("id", link.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting retailer link:", error)
    return NextResponse.json(
      { error: "Failed to delete retailer link" },
      { status: 500 }
    )
  }
}
