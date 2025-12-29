import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single retailer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const retailer = await prisma.retailer.findUnique({
      where: { id: parseInt(id) },
    })

    if (!retailer) {
      return NextResponse.json({ error: "Retailer not found" }, { status: 404 })
    }

    return NextResponse.json(retailer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch retailer" }, { status: 500 })
  }
}

// PATCH update retailer
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.slug !== undefined) {
      updateData.slug = body.slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
    if (body.iconUrl !== undefined) updateData.iconUrl = body.iconUrl || null
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const retailer = await prisma.retailer.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(retailer)
  } catch (error: any) {
    console.error("Error updating retailer:", error)
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A retailer with this slug already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update retailer" }, { status: 500 })
  }
}

// DELETE retailer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // First delete all book-retailer links for this retailer
    await prisma.bookRetailerLink.deleteMany({
      where: { retailerId: parseInt(id) },
    })

    // Then delete the retailer
    await prisma.retailer.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting retailer:", error)
    return NextResponse.json({ error: "Failed to delete retailer" }, { status: 500 })
  }
}
