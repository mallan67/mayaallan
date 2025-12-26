import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

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

    const data: Prisma.BookCreateInput = {
      slug: body.slug || "",
      title: body.title || "",
      subtitle1: body.subtitle1 || null,
      subtitle2: body.subtitle2 || null,
      tagsCsv: body.tagsCsv || null,
      isbn: body.isbn || null,
      copyright: body.copyright || null,
      blurb: body.blurb || null,
      coverUrl: body.coverUrl || null,
      backCoverUrl: body.backCoverUrl || null,
      ebookFileUrl: body.ebookFileUrl || null,
      hasEbook: Boolean(body.hasEbook),
      hasPaperback: Boolean(body.hasPaperback),
      hasHardcover: Boolean(body.hasHardcover),
      ebookPrice: body.ebookPrice ? Number(body.ebookPrice) : null,
      paperbackPrice: body.paperbackPrice ? Number(body.paperbackPrice) : null,
      hardcoverPrice: body.hardcoverPrice ? Number(body.hardcoverPrice) : null,
      isFeatured: Boolean(body.isFeatured),
      isPublished: Boolean(body.isPublished),
      isVisible: Boolean(body.isVisible),
      isComingSoon: Boolean(body.isComingSoon),
      allowDirectSale: Boolean(body.allowDirectSale),
      allowRetailerSale: Boolean(body.allowRetailerSale),
      stripePaymentLink: body.stripePaymentLink || null,
      paypalPaymentLink: body.paypalPaymentLink || null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      ogImageUrl: body.ogImageUrl || null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    }

    const book = await prisma.book.create({ data })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error("Error creating book:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to create book", details: message }, { status: 500 })
  }
}
