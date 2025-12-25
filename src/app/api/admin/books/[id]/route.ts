import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateBook, deleteBook } from "@/lib/mock-data"
import { z } from "zod"

const BookUpdateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  subtitle1: z.string().optional().nullable(),
  subtitle2: z.string().optional().nullable(),
  tagsCsv: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  copyright: z.string().optional().nullable(),
  blurb: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  backCoverUrl: z.string().optional().nullable(),
  ebookFileUrl: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  allowDirectSale: z.boolean().optional(),
  stripePaymentLink: z.string().optional().nullable(),
  paypalPaymentLink: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const data = BookUpdateSchema.parse(body)
    const book = await updateBook(Number(id), data)

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteBook(Number(id))

  if (!success) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
