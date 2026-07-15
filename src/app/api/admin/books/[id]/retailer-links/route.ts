import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"

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
    const links: RetailerLinkInput[] = body.links || []

    // Verify book exists
    const [book] = await sql`select id from books where id = ${bookId} limit 1`

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Delete existing links
    await sql`delete from book_retailer_links where book_id = ${bookId}`

    // Process each new link
    const createdLinks: any[] = []
    const errors: string[] = []

    // Whitelist for format_type to stop arbitrary strings reaching the DB.
    const ALLOWED_FORMATS = new Set(["ebook", "paperback", "hardcover", "audiobook"])

    for (const link of links) {
      // Skip empty retailer names
      if (!link.retailerName || link.retailerName.trim() === "") {
        continue
      }

      // Validate / sanitize each field BEFORE it touches the query layer.
      // Previously, retailerName was interpolated raw into a PostgREST
      // `.or(slug.eq.X,name.ilike.Y)` filter, which let any name containing
      // a comma, paren, dot, or PostgREST operator reshape the OR clause.
      const retailerName = link.retailerName.trim().slice(0, 200)
      const retailerSlug = retailerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100)

      // Skip rows whose slug normalizes to empty (e.g. name was all punctuation).
      if (!retailerSlug) {
        errors.push(`Skipped (invalid name): ${retailerName}`)
        continue
      }

      const formatType = ALLOWED_FORMATS.has(String(link.formatType || "ebook"))
        ? String(link.formatType || "ebook")
        : "ebook"

      const linkUrl = typeof link.url === "string" ? link.url.trim().slice(0, 2000) : ""

      try {
        // Find existing retailer by slug FIRST (slug is normalized, safe to
        // pass through .eq()). If not found, fall back to a case-insensitive
        // name search. Two separate queries replace the previous unsafe
        // .or() string interpolation.
        let retailer: any = null

        const [bySlug] = await sql`
          select * from retailers where slug = ${retailerSlug} limit 1
        `

        if (bySlug) {
          retailer = bySlug
        } else {
          // ilike binds the value as a parameter — safe even for arbitrary chars.
          const [byName] = await sql`
            select * from retailers where name ilike ${retailerName} limit 1
          `
          if (byName) retailer = byName
        }

        if (!retailer) {
          // Create new retailer
          const [newRetailer] = await sql`
            insert into retailers (name, slug, is_active)
            values (${retailerName}, ${retailerSlug}, true)
            returning *
          `
          retailer = newRetailer
        } else if (!retailer.name || retailer.name.trim() === "") {
          // Fix retailer with empty name
          const [updated] = await sql`
            update retailers set name = ${retailerName}, slug = ${retailerSlug}
            where id = ${retailer.id}
            returning *
          `
          retailer = updated
        }

        // Create the book-retailer link, returning it with its retailer embed.
        const [newLink] = await sql`
          with ins as (
            insert into book_retailer_links (book_id, retailer_id, url, format_type, is_active)
            values (${bookId}, ${retailer.id}, ${linkUrl}, ${formatType}, true)
            returning *
          )
          select
            i.*,
            (select json_build_object(
              'id', r.id, 'name', r.name, 'slug', r.slug,
              'icon_url', r.icon_url, 'is_active', r.is_active
            ) from retailers r where r.id = i.retailer_id) as retailer
          from ins i
        `

        createdLinks.push({
          id: newLink.id,
          formatType: newLink.format_type,
          retailerName: newLink.retailer?.name || retailerName,
          url: newLink.url,
        })

      } catch (linkError: any) {
        // Handle unique constraint violation
        if (linkError?.code === "23505") {
          errors.push(`Duplicate: ${retailerName} - ${formatType}`)
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
    // Log the full error server-side; return a generic message to the
    // client so internal DB hints / constraint names don't leak.
    console.error("Error saving retailer links:", error)
    return NextResponse.json(
      { error: "Failed to save retailer links" },
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
    const links = await sql`
      select
        l.*,
        (select json_build_object(
          'id', r.id, 'name', r.name, 'slug', r.slug,
          'icon_url', r.icon_url, 'is_active', r.is_active
        ) from retailers r where r.id = l.retailer_id) as retailer
      from book_retailer_links l
      where l.book_id = ${bookId}
      order by l.format_type asc
    `

    // Format for frontend
    const formatted = links.map((link) => ({
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
