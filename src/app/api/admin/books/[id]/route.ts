import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        retailers: {
          include: { retailer: true },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json(book)
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
  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Verify book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Build update data with explicit type handling
    const updateData: any = {}

    // String fields
    if (body.title !== undefined) updateData.title = String(body.title || "")
    if (body.slug !== undefined) updateData.slug = String(body.slug || "")
    if (body.subtitle1 !== undefined) updateData.subtitle1 = body.subtitle1 || null
    if (body.subtitle2 !== undefined) updateData.subtitle2 = body.subtitle2 || null
    if (body.tagsCsv !== undefined) updateData.tagsCsv = body.tagsCsv || null
    if (body.blurb !== undefined) updateData.blurb = body.blurb || null
    if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl || null
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null

    // Boolean fields - explicit conversion
    if (body.hasEbook !== undefined) updateData.hasEbook = Boolean(body.hasEbook)
    if (body.hasPaperback !== undefined) updateData.hasPaperback = Boolean(body.hasPaperback)
    if (body.hasHardcover !== undefined) updateData.hasHardcover = Boolean(body.hasHardcover)
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured)
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished)
    if (body.isVisible !== undefined) updateData.isVisible = Boolean(body.isVisible)
    if (body.isComingSoon !== undefined) updateData.isComingSoon = Boolean(body.isComingSoon)
    
    // CRITICAL: Direct sale fields (Issue #3A)
    if (body.allowDirectSale !== undefined) updateData.allowDirectSale = Boolean(body.allowDirectSale)
    if (body.allowRetailerSale !== undefined) updateData.allowRetailerSale = Boolean(body.allowRetailerSale)
    if (body.stripePaymentLink !== undefined) updateData.stripePaymentLink = body.stripePaymentLink || null
    if (body.paypalPaymentLink !== undefined) updateData.paypalPaymentLink = body.paypalPaymentLink || null

    // Numeric fields
    if (body.ebookPrice !== undefined) {
      updateData.ebookPrice = body.ebookPrice !== null && body.ebookPrice !== "" 
        ? parseFloat(body.ebookPrice) 
        : null
    }
    if (body.paperbackPrice !== undefined) {
      updateData.paperbackPrice = body.paperbackPrice !== null && body.paperbackPrice !== "" 
        ? parseFloat(body.paperbackPrice) 
        : null
    }
    if (body.hardcoverPrice !== undefined) {
      updateData.hardcoverPrice = body.hardcoverPrice !== null && body.hardcoverPrice !== "" 
        ? parseFloat(body.hardcoverPrice) 
        : null
    }

    // Debug logging
    console.log("Updating book with data:", {
      id: bookId,
      allowDirectSale: updateData.allowDirectSale,
      stripePaymentLink: updateData.stripePaymentLink,
      paypalPaymentLink: updateData.paypalPaymentLink,
      allowRetailerSale: updateData.allowRetailerSale,
    })

    // Perform update
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
      include: {
        retailers: {
          include: { retailer: true },
        },
      },
    })

    return NextResponse.json(updatedBook)
  } catch (error: any) {
    console.error("Error updating book:", error)
    
    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A book with this slug already exists" },
        { status: 409 }
      )
    }

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
  const { id } = await params
  const bookId = parseInt(id)

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 })
  }

  try {
    // Delete retailer links first
    await prisma.bookRetailerLink.deleteMany({
      where: { bookId },
    })

    // Delete book
    await prisma.book.delete({
      where: { id: bookId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting book:", error)
    
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
  }
}
