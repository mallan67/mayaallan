import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        retailers: {
          include: { retailer: true },
        },
      },
    })
    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Log what we received for debugging
    console.log("Creating book with data:", JSON.stringify(body, null, 2))

    // Build data object with only the fields we need
    const data: Record<string, unknown> = {
      slug: body.slug || "",
      title: body.title || "",
    }

    // Optional string fields
    if (body.subtitle1 !== undefined) data.subtitle1 = body.subtitle1 || null
    if (body.subtitle2 !== undefined) data.subtitle2 = body.subtitle2 || null
    if (body.tagsCsv !== undefined) data.tagsCsv = body.tagsCsv || null
    if (body.isbn !== undefined) data.isbn = body.isbn || null
    if (body.copyright !== undefined) data.copyright = body.copyright || null
    if (body.blurb !== undefined) data.blurb = body.blurb || null
    if (body.coverUrl !== undefined) data.coverUrl = body.coverUrl || null
    if (body.backCoverUrl !== undefined) data.backCoverUrl = body.backCoverUrl || null
    if (body.ebookFileUrl !== undefined) data.ebookFileUrl = body.ebookFileUrl || null
    if (body.stripePaymentLink !== undefined) data.stripePaymentLink = body.stripePaymentLink || null
    if (body.paypalPaymentLink !== undefined) data.paypalPaymentLink = body.paypalPaymentLink || null
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null
    if (body.ogImageUrl !== undefined) data.ogImageUrl = body.ogImageUrl || null

    // Boolean fields
    if (body.hasEbook !== undefined) data.hasEbook = Boolean(body.hasEbook)
    if (body.hasPaperback !== undefined) data.hasPaperback = Boolean(body.hasPaperback)
    if (body.hasHardcover !== undefined) data.hasHardcover = Boolean(body.hasHardcover)
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured)
    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished)
    if (body.isVisible !== undefined) data.isVisible = Boolean(body.isVisible)
    if (body.isComingSoon !== undefined) data.isComingSoon = Boolean(body.isComingSoon)
    if (body.allowDirectSale !== undefined) data.allowDirectSale = Boolean(body.allowDirectSale)
    if (body.allowRetailerSale !== undefined) data.allowRetailerSale = Boolean(body.allowRetailerSale)

    // Number fields (prices)
    if (body.ebookPrice !== undefined) data.ebookPrice = body.ebookPrice ? Number(body.ebookPrice) : null
    if (body.paperbackPrice !== undefined) data.paperbackPrice = body.paperbackPrice ? Number(body.paperbackPrice) : null
    if (body.hardcoverPrice !== undefined) data.hardcoverPrice = body.hardcoverPrice ? Number(body.hardcoverPrice) : null

    // Date field
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt)

    console.log("Prisma create data:", JSON.stringify(data, null, 2))

    const book = await prisma.book.create({ data })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error("Error creating book:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to create book", details: message }, { status: 500 })
  }
}
