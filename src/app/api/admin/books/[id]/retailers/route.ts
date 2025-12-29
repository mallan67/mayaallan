import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all retailer links for a book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const links = await prisma.bookRetailerLink.findMany({
      where: { bookId: parseInt(id) },
      include: { retailer: true },
      orderBy: [{ retailer: { name: "asc" } }, { formatType: "asc" }],
    })
    return NextResponse.json(links)
  } catch (error) {
    console.error("Error fetching book retailer links:", error)
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}

// POST create new retailer link for a book
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    if (!body.retailerId) {
      return NextResponse.json({ error: "retailerId is required" }, { status: 400 })
    }

    const link = await prisma.bookRetailerLink.create({
      data: {
        bookId: parseInt(id),
        retailerId: parseInt(body.retailerId),
        url: body.url || "",
        formatType: body.formatType || "ebook",
        isActive: body.isActive !== false,
      },
      include: { retailer: true },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error: any) {
    console.error("Error creating book retailer link:", error)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This format already exists for this retailer on this book" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
  }
}
