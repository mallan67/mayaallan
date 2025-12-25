import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllBooks, createBook } from "@/lib/mock-data"
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
  isPublished: z.boolean().default(false),
  isVisible: z.boolean().default(false),
  isComingSoon: z.boolean().default(false),
  allowDirectSale: z.boolean().default(false),
  stripePaymentLink: z.string().optional().nullable(),
  paypalPaymentLink: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
})

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const books = await getAllBooks()
  return NextResponse.json(books)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = BookSchema.parse(body)
    const book = await createBook(data)
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}
