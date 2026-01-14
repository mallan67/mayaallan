import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const navId = Number.parseInt(id)

    await prisma.navigationItem.delete({
      where: { id: navId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete navigation item:", error)
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 })
  }
}
