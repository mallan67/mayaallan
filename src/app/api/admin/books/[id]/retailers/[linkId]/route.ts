import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { linkId } = await params

  try {
    const body = await request.json()
    
    const link = await prisma.bookRetailerLink.update({
      where: { id: parseInt(linkId) },
      data: {
        url: body.url !== undefined ? body.url : undefined,
        formatType: body.formatType !== undefined ? body.formatType : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
      include: { retailer: true },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error("Error updating retailer link:", error)
    return NextResponse.json({ error: "Failed to update retailer link" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { linkId } = await params

  try {
    await prisma.bookRetailerLink.delete({
      where: { id: parseInt(linkId) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting retailer link:", error)
    return NextResponse.json({ error: "Failed to delete retailer link" }, { status: 500 })
  }
}
