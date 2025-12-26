import { NextResponse } from "next/server"
import { z } from "zod"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const AddRetailerSchema = z.object({
  retailerId: z.union([z.string(), z.number()]),
  url: z.string().optional().default(""),
  formatType: z.enum(["ebook", "paperback", "hardcover", "audiobook"]).optional().default("ebook"),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const links = await prisma.bookRetailerLink.findMany({
    where: { bookId: Number(id) },
    include: { retailer: true },
    orderBy: [{ retailerId: "asc" }, { formatType: "asc" }],
  })

  return NextResponse.json(links)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const data = AddRetailerSchema.parse(body)

    const retailerId = Number(data.retailerId)
    const url = (data.url ?? "").trim()

    // If no URL yet, keep link inactive so it never shows on the frontend.
    const isActive = data.isActive ?? (url.length > 0)

    const link = await prisma.bookRetailerLink.upsert({
      where: {
        bookId_retailerId_formatType: {
          bookId: Number(id),
          retailerId,
          formatType: data.formatType,
        },
      },
      create: {
        bookId: Number(id),
        retailerId,
        url,
        formatType: data.formatType,
        isActive,
      },
      update: {
        url,
        isActive,
      },
      include: { retailer: true },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add retailer" }, { status: 500 })
  }
}

// Back-compat for old admin screen: DELETE /api/admin/books/:id/retailers?linkId=123
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get("linkId")

  if (!linkId) {
    return NextResponse.json({ error: "linkId is required" }, { status: 400 })
  }

  try {
    await prisma.bookRetailerLink.delete({ where: { id: Number(linkId) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Retailer link not found" }, { status: 404 })
  }
}
