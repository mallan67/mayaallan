import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

function toDecimalOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value !== "string") return null
  const cleaned = value.trim().replace(/[$,]/g, "")
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params

  try {
    const book = await prisma.book.findUnique({
      where: { slug },
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
    console.error("Error fetching book by slug:", error)
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params

  try {
    // First find the book by slug to get its ID
    const existingBook = await prisma.book.findUnique({ where: { slug } })
    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const body = await request.json()
    const data: Prisma.BookUpdateInput = {}

    if (body.slug !== undefined) data.slug = body.slug
    if (body.title !== undefined) data.title = body.title
    if (body.subtitle1 !== undefined) data.subtitle1 = body.subtitle1 || null
    if (body.subtitle2 !== undefined) data.subtitle2 = body.subtitle2 || null
    if (body.tagsCsv !== undefined) data.tagsCsv = body.tagsCsv || null
    if (body.isbn !== undefined) data.isbn = body.isbn || null
    if (body.copyright !== undefined) data.copyright = body.copyright || null
    if (body.blurb !== undefined) data.blurb = body.blurb || null
    if (body.coverUrl !== undefined) data.coverUrl = body.coverUrl || null
    if (body.backCoverUrl !== undefined) data.backCoverUrl = body.backCoverUrl || null
    if (body.ebookFileUrl !== undefined) data.ebookFileUrl = body.ebookFileUrl || null
    if (body.hasEbook !== undefined) data.hasEbook = Boolean(body.hasEbook)
    if (body.hasPaperback !== undefined) data.hasPaperback = Boolean(body.hasPaperback)
    if (body.hasHardcover !== undefined) data.hasHardcover = Boolean(body.hasHardcover)
    if (body.ebookPrice !== undefined) data.ebookPrice = toDecimalOrNull(body.ebookPrice)
    if (body.paperbackPrice !== undefined) data.paperbackPrice = toDecimalOrNull(body.paperbackPrice)
    if (body.hardcoverPrice !== undefined) data.hardcoverPrice = toDecimalOrNull(body.hardcoverPrice)
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured)
    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished)
    if (body.isVisible !== undefined) data.isVisible = Boolean(body.isVisible)
    if (body.isComingSoon !== undefined) data.isComingSoon = Boolean(body.isComingSoon)
    if (body.allowDirectSale !== undefined) data.allowDirectSale = Boolean(body.allowDirectSale)
    if (body.allowRetailerSale !== undefined) data.allowRetailerSale = Boolean(body.allowRetailerSale)
    if (body.stripePaymentLink !== undefined) data.stripePaymentLink = body.stripePaymentLink || null
    if (body.paypalPaymentLink !== undefined) data.paypalPaymentLink = body.paypalPaymentLink || null
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null
    if (body.ogImageUrl !== undefined) data.ogImageUrl = body.ogImageUrl || null

    const book = await prisma.book.update({
      where: { id: existingBook.id },
      data,
      include: { retailers: { include: { retailer: true } } },
    })

    return NextResponse.json(book)
  } catch (error: any) {
    console.error("Error updating book by slug:", error)
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
  }
}
