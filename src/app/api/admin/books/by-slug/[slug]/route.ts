import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params

  try {
    const book = await prisma.book.findUnique({
      where: { slug },
      include: { retailers: { include: { retailer: true } } },
    })

    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 })
    return NextResponse.json(book)
  } catch (error) {
    console.error("Error fetching book by slug:", error)
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params

  try {
    const body = await request.json()

    // Find existing book first (by old slug)
    const existing = await prisma.book.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: "Book not found" }, { status: 404 })

    // Build update data (only real DB fields)
    const data: Record<string, unknown> = {}

    // Required-ish strings
    if (body.title !== undefined) data.title = body.title || ""
    if (body.slug !== undefined) data.slug = body.slug || ""

    // Optional strings
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

    // Booleans
    if (body.hasEbook !== undefined) data.hasEbook = Boolean(body.hasEbook)
    if (body.hasPaperback !== undefined) data.hasPaperback = Boolean(body.hasPaperback)
    if (body.hasHardcover !== undefined) data.hasHardcover = Boolean(body.hasHardcover)
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured)
    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished)
    if (body.isVisible !== undefined) data.isVisible = Boolean(body.isVisible)
    if (body.isComingSoon !== undefined) data.isComingSoon = Boolean(body.isComingSoon)
    if (body.allowDirectSale !== undefined) data.allowDirectSale = Boolean(body.allowDirectSale)
    if (body.allowRetailerSale !== undefined) data.allowRetailerSale = Boolean(body.allowRetailerSale)

    // Prices (allow 0, treat "" as null)
    if (body.ebookPrice !== undefined) data.ebookPrice = body.ebookPrice === "" || body.ebookPrice === null ? null : Number(body.ebookPrice)
    if (body.paperbackPrice !== undefined) data.paperbackPrice = body.paperbackPrice === "" || body.paperbackPrice === null ? null : Number(body.paperbackPrice)
    if (body.hardcoverPrice !== undefined) data.hardcoverPrice = body.hardcoverPrice === "" || body.hardcoverPrice === null ? null : Number(body.hardcoverPrice)

    // Date
    if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null

    const updated = await prisma.book.update({
      where: { id: existing.id },
      data,
      include: { retailers: { include: { retailer: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating book by slug:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to update book", details: message }, { status: 500 })
  }
}
