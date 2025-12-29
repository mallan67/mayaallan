import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all retailers
export async function GET() {
  try {
    const retailers = await prisma.retailer.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(retailers)
  } catch (error) {
    console.error("Error fetching retailers:", error)
    return NextResponse.json({ error: "Failed to fetch retailers" }, { status: 500 })
  }
}

// POST create new retailer
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const name = body.name.trim()
    const slug = (body.slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const retailer = await prisma.retailer.create({
      data: {
        name,
        slug,
        iconUrl: body.iconUrl || null,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(retailer, { status: 201 })
  } catch (error: any) {
    console.error("Error creating retailer:", error)
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A retailer with this slug already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create retailer" }, { status: 500 })
  }
}
