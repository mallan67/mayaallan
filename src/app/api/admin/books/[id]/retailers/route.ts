import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

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
    const links = await prisma.bookRetailerLink.findMany({
      where: { bookId },
      include: {
        retailer: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { retailer: { name: "asc" } },
        { formatType: "asc" },
      ],
    })

    return NextResponse.json(links)
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
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Verify retailer exists
    const retailer = await prisma.retailer.findUnique({
      where: { id: parseInt(retailerId) },
    })
    if (!retailer) {
      return NextResponse.json(
        { error: "Retailer not found" },
        { status: 404 }
      )
    }

    // Create the link
    const link = await prisma.bookRetailerLink.create({
      data: {
        bookId,
        retailerId: parseInt(retailerId),
        url: url || "",
        formatType: formatType || "ebook",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        retailer: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error: any) {
    console.error("Error creating retailer link:", error)

    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A link for this retailer and format already exists" },
        { status: 409 }
      )
    }

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
    // If formatType is provided, we'll try to find that specific link
    // Otherwise, find any link for this retailer
    const whereClause: any = {
      bookId,
      retailerId: parseInt(retailerId),
    }

    // If formatType is provided and we're updating it, we need to find the current link
    // The UI might be changing the formatType, so we find by retailerId first
    const existingLinks = await prisma.bookRetailerLink.findMany({
      where: whereClause,
      include: { retailer: true },
    })

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
        (link) => link.formatType === formatType
      )
      if (matchingLink) {
        linkToUpdate = matchingLink
      }
    }

    // Build update data
    const updateData: any = {}
    if (url !== undefined) updateData.url = url
    if (formatType !== undefined && formatType !== linkToUpdate.formatType) {
      // Check if changing formatType would violate unique constraint
      const conflictCheck = await prisma.bookRetailerLink.findFirst({
        where: {
          bookId,
          retailerId: parseInt(retailerId),
          formatType: formatType,
          id: { not: linkToUpdate.id },
        },
      })
      if (conflictCheck) {
        return NextResponse.json(
          { error: "A link for this retailer and format already exists" },
          { status: 409 }
        )
      }
      updateData.formatType = formatType
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    // Update the link
    const updatedLink = await prisma.bookRetailerLink.update({
      where: { id: linkToUpdate.id },
      data: updateData,
      include: {
        retailer: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json(updatedLink)
  } catch (error: any) {
    console.error("Error updating retailer link:", error)

    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A link for this retailer and format already exists" },
        { status: 409 }
      )
    }

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
    const whereClause: any = {
      bookId,
      retailerId: parseInt(retailerId),
    }
    if (formatType) {
      whereClause.formatType = formatType
    }

    const link = await prisma.bookRetailerLink.findFirst({
      where: whereClause,
    })

    if (!link) {
      return NextResponse.json(
        { error: "Retailer link not found" },
        { status: 404 }
      )
    }

    await prisma.bookRetailerLink.delete({
      where: { id: link.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting retailer link:", error)
    return NextResponse.json(
      { error: "Failed to delete retailer link" },
      { status: 500 }
    )
  }
}
