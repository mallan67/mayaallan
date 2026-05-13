import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
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

    const { error } = await supabaseAdmin
      .from(Tables.navigationItems)
      .delete()
      .eq("id", navId)

    if (error) throw error

    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete navigation item:", error)
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 })
  }
}
