import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BookUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
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
  hasEbook: z.boolean().optional(),
  hasPaperback: z.boolean().optional(),
  hasHardcover: z.boolean().optional(),
  // Prices
  ebookPrice: z.number().optional().nullable(),
  paperbackPrice: z.number().optional().nullable(),
  hardcoverPrice: z.number().optional().nullable(),
  // Publishing
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  // Sales
  allowDirectSale: z.boolean().optional(),
  allowRetailerSale: z.boolean().optional(),
  stripePaymentLink: z.string().optional().nullable(),
  paypalPaymentLink: z.string().optional().nullable(),
  // SEO
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    
    // Remove fields that shouldn't be updated directly
    const { retailers, createdAt, updatedAt, id: bodyId, ...rest } = body
    
    const parsed = BookUpdateSchema.parse(rest)

    const updateData: Record<string, unknown> = { ...parsed }
    if (parsed.publishedAt) {
      updateData.publishedAt = new Date(parsed.publishedAt)
    }

    const book = await prisma.book.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        retailers: {
          include: { retailer: true },
        },
      },
    })

    return NextResponse.json(book)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating book:", error)
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.book.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
  }
}
