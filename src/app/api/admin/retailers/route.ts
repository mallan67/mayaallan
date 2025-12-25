import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllRetailers, createRetailer } from "@/lib/mock-data"
import { z } from "zod"

const RetailerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logoUrl: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const retailers = await getAllRetailers()
  return NextResponse.json(retailers)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = RetailerSchema.parse(body)
    const retailer = await createRetailer(data)
    return NextResponse.json(retailer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create retailer" }, { status: 500 })
  }
}
