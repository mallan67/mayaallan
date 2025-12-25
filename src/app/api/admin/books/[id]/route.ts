import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getBookById, updateBook, deleteBook } from "@/lib/mock-data"
import { z } from "zod"

const UpdateBookSchema = z.object({
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
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  allowDirectSale: z.boolean().optional(),
  stripePaymentLink: z.string().optional().nullable(),
  paypalPaymentLink: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const book = await getBookById(id)
  
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }
  
  return NextResponse.json(book)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  
  try {
    const body = await request.json()
    const data = UpdateBookSchema.parse(body)
    const book = await updateBook(id, data)
    
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }
    
    return NextResponse.json(book)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteBook(id)
  
  if (!success) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }
  
  return NextResponse.json({ ok: true })
}
