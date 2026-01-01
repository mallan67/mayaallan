import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

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
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Delete existing links
    const deleted = await prisma.bookRetailerLink.deleteMany({
      where: { bookId },
    })
    console.log(`Deleted ${deleted.count} existing links`)

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
        let retailer = await prisma.retailer.findFirst({
          where: {
            OR: [
              { slug: retailerSlug },
              { name: { equals: retailerName, mode: "insensitive" } },
            ],
          },
        })

        if (!retailer) {
          // Create new retailer
          retailer = await prisma.retailer.create({
            data: {
              name: retailerName,
              slug: retailerSlug,
              isActive: true,
            },
          })
          console.log(`Created new retailer: ${retailerName} (id: ${retailer.id})`)
        } else if (!retailer.name || retailer.name.trim() === "") {
          // Fix retailer with empty name
          retailer = await prisma.retailer.update({
            where: { id: retailer.id },
            data: { name: retailerName, slug: retailerSlug },
          })
          console.log(`Fixed retailer name: ${retailerName} (id: ${retailer.id})`)
        }

        // Create the book-retailer link
        const newLink = await prisma.bookRetailerLink.create({
          data: {
            bookId,
            retailerId: retailer.id,
            url: link.url || "",
            formatType: link.formatType || "ebook",
            isActive: true,
          },
          include: { retailer: true },
        })

        createdLinks.push({
          id: newLink.id,
          formatType: newLink.formatType,
          retailerName: newLink.retailer.name,
          url: newLink.url,
        })

        console.log(`Created link: ${retailerName} - ${link.formatType}`)

      } catch (linkError: any) {
        // Handle unique constraint violation
        if (linkError?.code === "P2002") {
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
    const links = await prisma.bookRetailerLink.findMany({
      where: { bookId },
      include: { retailer: true },
      orderBy: [
        { formatType: "asc" },
        { retailer: { name: "asc" } },
      ],
    })

    // Format for frontend
    const formatted = links.map((link) => ({
      id: link.id,
      formatType: link.formatType,
      retailerName: link.retailer?.name || "",
      url: link.url,
    }))

    return NextResponse.json(formatted)

  } catch (error) {
    console.error("Error fetching retailer links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}
