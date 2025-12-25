import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateRetailer } from "@/lib/mock-data"
import { z } from "zod"

const updateRetailerSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  iconUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const data = updateRetailerSchema.parse(body)
    const retailer = await updateRetailer(Number(id), data)

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
