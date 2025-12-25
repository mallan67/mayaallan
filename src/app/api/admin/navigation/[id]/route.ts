import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { deleteNavigationItem } from "@/lib/mock-data"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const navId = Number.parseInt(id)
    const success = await deleteNavigationItem(navId)

    if (!success) {
      return NextResponse.json({ error: "Navigation item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 })
  }
}
