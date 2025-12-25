import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import {
  getBookById,
  updateBook,
  deleteBook,
} from "@/lib/mock-data"
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
  const book = await getBookById(Number(id))

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

  const book = await updateBook(Number(id), data)

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json(book)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteBook(Number(id))

  if (!success) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
