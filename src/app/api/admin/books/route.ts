import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BookSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle1: z.string().optional().nullable(),
  subtitle2: z.string().optional().nullable(),
  tagsCsv: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  copyright: z.string().optional().nullable(),
  blurb: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  backCoverUrl: z.string().optional().nullable(),
  ebookFileUrl: z.string().optional().nullable(),
  // Book formats
  hasEbook: z.boolean().default(true),
  hasPaperback: z.boolean().default(false),
  hasHardcover: z.boolean().default(false),
  // Prices
  ebookPrice: z.number().optional().nullable(),
  paperbackPrice: z.number().optional().nullable(),
  hardcoverPrice: z.number().optional().nullable(),
  // Publishing
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isVisible: z.boolean().default(false),
  isComingSoon: z.boolean().default(false),
  // Sales
  allowDirectSale: z.boolean().default(false),
  allowRetailerSale: z.boolean().default(false),
  stripePaymentLink: z.string().optional().nullable(),
  paypalPaymentLink: z.string().optional().nullable(),
  // SEO
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
})

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
    
    // Remove fields that shouldn't be in create
    const { id, retailers, createdAt, updatedAt, ...rest } = body
    
    const parsed = BookSchema.parse(rest)

    const book = await prisma.book.create({
      data: {
        slug: parsed.slug,
        title: parsed.title,
        subtitle1: parsed.subtitle1,
        subtitle2: parsed.subtitle2,
        tagsCsv: parsed.tagsCsv,
        isbn: parsed.isbn,
        copyright: parsed.copyright,
        blurb: parsed.blurb,
        coverUrl: parsed.coverUrl,
        backCoverUrl: parsed.backCoverUrl,
        ebookFileUrl: parsed.ebookFileUrl,
        hasEbook: parsed.hasEbook,
        hasPaperback: parsed.hasPaperback,
        hasHardcover: parsed.hasHardcover,
        ebookPrice: parsed.ebookPrice,
        paperbackPrice: parsed.paperbackPrice,
        hardcoverPrice: parsed.hardcoverPrice,
        isFeatured: parsed.isFeatured,
        isPublished: parsed.isPublished,
        isVisible: parsed.isVisible,
        isComingSoon: parsed.isComingSoon,
        allowDirectSale: parsed.allowDirectSale,
        allowRetailerSale: parsed.allowRetailerSale,
        stripePaymentLink: parsed.stripePaymentLink,
        paypalPaymentLink: parsed.paypalPaymentLink,
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription,
        ogImageUrl: parsed.ogImageUrl,
        publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : null,
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating book:", error)
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
