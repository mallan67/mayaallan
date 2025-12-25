import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllRetailers, updateRetailer } from "@/lib/mock-data"
import { z } from "zod"

const UpdateRetailerSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  logoUrl: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().optional(),
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
  const allRetailers = await getAllRetailers()
  const retailer = allRetailers.find(r => r.id === id)
  
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
  
  try {
    const body = await request.json()
    const data = UpdateRetailerSchema.parse(body)
    const retailer = await updateRetailer(id, data)
    
    if (!retailer) {
      return NextResponse.json({ error: "Retailer not found" }, { status: 404 })
    }
    
    return NextResponse.json(retailer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
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

  // Note: deleteRetailer not available in mock-data, return not implemented
  return NextResponse.json({ error: "Delete not implemented" }, { status: 501 })
}
