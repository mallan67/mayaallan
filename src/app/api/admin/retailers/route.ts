import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const retailer = await prisma.retailer.create({
      data: {
        name: body.name,
        slug: body.slug,
        iconUrl: body.iconUrl || null,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(retailer, { status: 201 })
  } catch (error: any) {
    console.error("Error creating retailer:", error)
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Retailer with this slug already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create retailer" }, { status: 500 })
  }
}
