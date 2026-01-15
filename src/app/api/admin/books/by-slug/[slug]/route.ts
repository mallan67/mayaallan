import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })

  try {
    const book = await prisma.book.findFirst({
      where: { slug },
      include: {
        retailers: { include: { retailer: true } },
      },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Return a plain JSON shape the admin UI expects.
    return NextResponse.json(book)
  } catch (error) {
    console.error("Error fetching book by slug:", error)
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 })
  }
}
