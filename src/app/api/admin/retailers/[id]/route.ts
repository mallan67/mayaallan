import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllRetailers, updateRetailer } from "@/lib/mock-data"
import { z } from "zod"

const UpdateRetailerSchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const retailerId = Number(id)

  const allRetailers = await getAllRetailers()
  const retailer = allRetailers.find((r) => r.id === retailerId)

  if (!retailer) {
    return NextResponse.json({ error: "Retailer not found" }, { status: 404 })
  }

  return NextResponse.json(retailer)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const retailerId = Number(id)

  try {
    const body = await request.json()
    const data = UpdateRetailerSchema.parse(body)

    const updated = await updateRetailer(retailerId, data as any)
    if (!updated) {
      return NextResponse.json({ error: "Retailer not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Failed to update retailer" }, { status: 500 })
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
  const retailerId = Number(id)

  const ok = await deleteRetailer(retailerId)
  if (!ok) {
    return NextResponse.json({ error: "Retailer not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
