import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAllRetailers, createRetailer } from "@/lib/mock-data"
import { z } from "zod"

const createRetailerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  iconUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const retailers = await getAllRetailers()
  return NextResponse.json(retailers)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = createRetailerSchema.parse(body)
    const retailer = await createRetailer(data)
    return NextResponse.json(retailer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create retailer" }, { status: 500 })
  }
}
