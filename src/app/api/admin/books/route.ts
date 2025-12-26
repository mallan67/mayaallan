cat > src/app/api/admin/books/route.ts <<'EOF'
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
      ebookPrice: toDecimalOrNull(body.ebookPrice),
      paperbackPrice: toDecimalOrNull(body.paperbackPrice),
      hardcoverPrice: toDecimalOrNull(body.hardcoverPrice),
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
  } catch (error: any) {
    console.error("Error creating book:", error)

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Slug already exists", details: error?.meta },
        { status: 409 }
      )
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to create book", details: message },
      { status: 500 }
    )
  }
}
EOF
