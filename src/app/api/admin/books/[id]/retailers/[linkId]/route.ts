import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT update a retailer link
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const { linkId } = await params

  try {
    const body = await request.json()

    const updateData: any = {}
    if (body.url !== undefined) updateData.url = body.url
    if (body.formatType !== undefined) updateData.formatType = body.formatType
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const link = await prisma.bookRetailerLink.update({
      where: { id: parseInt(linkId) },
      data: updateData,
      include: { retailer: true },
    })

    return NextResponse.json(link)
  } catch (error: any) {
    console.error("Error updating book retailer link:", error)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This format already exists for this retailer" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 })
  }
}

// DELETE a retailer link
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const { linkId } = await params

  try {
    await prisma.bookRetailerLink.delete({
      where: { id: parseInt(linkId) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting book retailer link:", error)
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 })
  }
}
