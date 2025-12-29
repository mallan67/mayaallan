import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface LinkInput {
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
  const { id } = await params
  const bookId = parseInt(id)

  try {
    const body = await request.json()
    const links: LinkInput[] = body.links || []

    // Delete existing links for this book
    await prisma.bookRetailerLink.deleteMany({
      where: { bookId },
    })

    // Process each new link
    const createdLinks = []

    for (const link of links) {
      if (!link.retailerName || !link.retailerName.trim()) {
        continue // Skip links without retailer name
      }

      const retailerName = link.retailerName.trim()
      const retailerSlug = retailerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      // Find or create retailer
      let retailer = await prisma.retailer.findFirst({
        where: {
          OR: [
            { name: retailerName },
            { slug: retailerSlug },
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
        // Update retailer if name is empty
        retailer = await prisma.retailer.update({
          where: { id: retailer.id },
          data: { name: retailerName, slug: retailerSlug },
        })
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

      createdLinks.push(newLink)
    }

    return NextResponse.json({ success: true, links: createdLinks })
  } catch (error: any) {
    console.error("Error saving retailer links:", error)
    return NextResponse.json({ error: "Failed to save retailer links" }, { status: 500 })
  }
}

// GET - Get all retailer links for a book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const links = await prisma.bookRetailerLink.findMany({
      where: { bookId: parseInt(id) },
      include: { retailer: true },
      orderBy: [{ formatType: "asc" }, { retailer: { name: "asc" } }],
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error("Error fetching retailer links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}
