import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"

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
    const links = await sql`
      select
        l.*,
        case when r.id is null then null else json_build_object(
          'id', r.id, 'name', r.name, 'slug', r.slug,
          'icon_url', r.icon_url, 'is_active', r.is_active
        ) end as retailer
      from book_retailer_links l
      left join retailers r on r.id = l.retailer_id
      where l.book_id = ${bookId}
      order by l.format_type asc
    `

    // Map to camelCase
    const mapped = links.map((link) => ({
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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

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
    const [book] = await sql`select id from books where id = ${bookId} limit 1`

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Verify retailer exists
    const [retailer] = await sql`select id from retailers where id = ${parseInt(retailerId)} limit 1`

    if (!retailer) {
      return NextResponse.json(
        { error: "Retailer not found" },
        { status: 404 }
      )
    }

    // Create the link, returning it with its retailer embed in one round-trip.
    let link
    try {
      const [row] = await sql`
        with ins as (
          insert into book_retailer_links (book_id, retailer_id, url, format_type, is_active)
          values (
            ${bookId}, ${parseInt(retailerId)}, ${url || ""},
            ${formatType || "ebook"}, ${isActive !== undefined ? Boolean(isActive) : true}
          )
          returning *
        )
        select
          i.*,
          case when r.id is null then null else json_build_object(
            'id', r.id, 'name', r.name, 'slug', r.slug,
            'icon_url', r.icon_url, 'is_active', r.is_active
          ) end as retailer
        from ins i
        left join retailers r on r.id = i.retailer_id
      `
      link = row
    } catch (insertErr) {
      if ((insertErr as { code?: string })?.code === "23505") {
        return NextResponse.json(
          { error: "A link for this retailer and format already exists" },
          { status: 409 }
        )
      }
      throw insertErr
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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

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
    const existingLinks = await sql`
      select
        l.*,
        case when r.id is null then null else json_build_object(
          'id', r.id, 'name', r.name, 'slug', r.slug,
          'icon_url', r.icon_url, 'is_active', r.is_active
        ) end as retailer
      from book_retailer_links l
      left join retailers r on r.id = l.retailer_id
      where l.book_id = ${bookId} and l.retailer_id = ${parseInt(retailerId)}
    `

    if (existingLinks.length === 0) {
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
      const [conflictCheck] = await sql`
        select id from book_retailer_links
        where book_id = ${bookId} and retailer_id = ${parseInt(retailerId)}
          and format_type = ${formatType} and id <> ${linkToUpdate.id}
        limit 1
      `

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
    let updatedLink
    try {
      const [row] = await sql`
        with upd as (
          update book_retailer_links set ${sql(updateData)}
          where id = ${linkToUpdate.id}
          returning *
        )
        select
          u.*,
          case when r.id is null then null else json_build_object(
            'id', r.id, 'name', r.name, 'slug', r.slug,
            'icon_url', r.icon_url, 'is_active', r.is_active
          ) end as retailer
        from upd u
        left join retailers r on r.id = u.retailer_id
      `
      updatedLink = row
    } catch (updateErr) {
      if ((updateErr as { code?: string })?.code === "23505") {
        return NextResponse.json(
          { error: "A link for this retailer and format already exists" },
          { status: 409 }
        )
      }
      throw updateErr
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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

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

    // Find the link to delete (optional format_type filter as a fragment).
    const [link] = await sql`
      select id from book_retailer_links
      where book_id = ${bookId} and retailer_id = ${parseInt(retailerId)}
      ${formatType ? sql`and format_type = ${formatType}` : sql``}
      limit 1
    `

    if (!link) {
      return NextResponse.json(
        { error: "Retailer link not found" },
        { status: 404 }
      )
    }

    await sql`delete from book_retailer_links where id = ${link.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting retailer link:", error)
    return NextResponse.json(
      { error: "Failed to delete retailer link" },
      { status: 500 }
    )
  }
}
