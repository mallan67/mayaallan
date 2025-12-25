import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getBookBySlug, updateBook, deleteBook } from "@/lib/mock-data"
import { z } from "zod"

const UpdateBookSchema = z.object({
  title: z.string().min(1),
  subtitle1: z.string().optional(),
  subtitle2: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean(),
  visible: z.boolean(),
  comingSoon: z.boolean(),
  placement: z.enum(["homepage", "books", "both"]),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // In this project, [id] maps to the book "slug" (string), not a numeric ID.
  const book = await getBookBySlug(id)

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json(book)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const data = UpdateBookSchema.parse(body)

  // updateBook expects a numeric ID in this project.
  const book = await updateBook(Number(id), data)

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json(book)
}

export async function DELETE(
  request: Request,
  { pa
