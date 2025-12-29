import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RetailerLinkInput {
  id?: number
  formatType: string
  retailerName: string
  url: string
}

/**
 * PUT /api/admin/books/[id]/retailer-links
 * 
 * Replaces all retailer links for a book.
 * - Accepts free-text retailer names
 * - Auto-creates Retailer records if they don't exist
 * - Creates BookRetailerLink records with proper foreign keys
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const links: RetailerLinkInput[] = body.links || []

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Step 1: Delete ALL existing links for this book
    // This is a "replace all" operation
    await prisma.bookRetailerLink.deleteMany({
      where: { bookId },
    })

    // Step 2: Process each new link
    const createdLinks = []

    for (const link of links) {
      // Skip links without retailer name
      if (!link.retailerName || link.retailerName.trim() === "") {
        continue
      }

      const retailerName = link.retailerName.trim()
      
      // Generate a slug from the retailer name
      const retailerSlug = retailerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      // Step 2a: Find or create the Retailer
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
      } else if (!retailer.name || retailer.name.trim() === "") {
        // Fix retailer with empty name
        retailer = await prisma.retailer.update({
          where: { id: retailer.id },
          data: { 
            name: retailerName,
            slug: retailerSlug,
          },
        })
      }

      // Step 2b: Create the BookRetailerLink
      try {
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
      } catch (linkError: any) {
        // Handle unique constraint violation (same book+retailer+format)
        if (linkError?.code === "P2002") {
          console.warn(`Duplicate link skipped: ${retailerName} - ${link.formatType}`)
          continue
        }
        throw linkError
      }
    }

    return NextResponse.json({ 
      success: true, 
      links: createdLinks,
      message: `Saved ${createdLinks.length} retailer link(s)`
    })

  } catch (error: any) {
    console.error("Error saving retailer links:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save retailer links" }, 
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/books/[id]/retailer-links
 * 
 * Returns all retailer links for a book with retailer details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Transform to the format the frontend expects
    const formattedLinks = links.map((link) => ({
      id: link.id,
      formatType: link.formatType,
      retailerName: link.retailer?.name || "",
      url: link.url,
    }))

    return NextResponse.json(formattedLinks)

  } catch (error) {
    console.error("Error fetching retailer links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}
