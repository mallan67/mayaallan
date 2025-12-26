import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    
    const retailer = await prisma.retailer.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        slug: body.slug !== undefined ? body.slug : undefined,
        iconUrl: body.iconUrl !== undefined ? (body.iconUrl || null) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    })
    
    return NextResponse.json(retailer)
  } catch (error: any) {
    console.error("Error updating retailer:", error)
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
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

  try {
    // First delete all book-retailer links
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
