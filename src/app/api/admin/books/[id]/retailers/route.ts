import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getBookRetailerLinks, createBookRetailerLink, deleteBookRetailerLink } from "@/lib/mock-data"
import { z } from "zod"

const AddRetailerSchema = z.object({
  retailerId: z.string().min(1),
  purchaseUrl: z.string().url(),
  displayOrder: z.number().int().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const retailers = await getBookRetailerLinks(parseInt(id))
  return NextResponse.json(retailers)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  
  try {
    const body = await request.json()
    const data = AddRetailerSchema.parse(body)
    const result = await createBookRetailerLink({ bookId: parseInt(id), ...data })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to add retailer" }, { status: 500 })
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
  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get("linkId")
  
  if (!linkId) {
    return NextResponse.json({ error: "linkId is required" }, { status: 400 })
  }
  
  const success = await deleteBookRetailerLink(linkId)
  
  if (!success) {
    return NextResponse.json({ error: "Retailer link not found" }, { status: 404 })
  }
  
  return NextResponse.json({ ok: true })
}
