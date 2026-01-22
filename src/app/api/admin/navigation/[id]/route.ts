import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete navigation item:", error)
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 })
  }
}
