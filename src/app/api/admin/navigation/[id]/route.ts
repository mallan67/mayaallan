import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const navId = Number.parseInt(id)

    await sql`delete from navigation_items where id = ${navId}`

    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete navigation item:", error)
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 })
  }
}
