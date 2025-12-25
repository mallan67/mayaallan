import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import {
  getBookRetailerLinks,
  createBookRetailerLink,
  updateBookRetailerLink,
  deleteBookRetailerLink,
} from "@/lib/mock-data"
import { z } from "zod"

const retailerLinkSchema = z.object({
  retailerId: z.number(),
  url: z.string().url(),
  formatType: z.enum(["ebook", "print", "hardcover"]),
  isActive: z.boolean().default(true),
})

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const links = await getBookRetailerLinks(Number(id))
  return NextResponse.json(links)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const data = retailerLinkSchema.parse(body)
    const link = await createBookRetailerLink({
      bookId: Number(id),
      ...data,
    })
    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create retailer link" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { retailerId, ...data } = body
    const link = await updateBookRetailerLink(Number(id), retailerId, data)

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json(link)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update retailer link" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const retailerId = searchParams.get("retailerId")

    if (!retailerId) {
      return NextResponse.json({ error: "Retailer ID required" }, { status: 400 })
    }

    const success = await deleteBookRetailerLink(Number(id), Number(retailerId))

    if (!success) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete retailer link" }, { status: 500 })
  }
}
