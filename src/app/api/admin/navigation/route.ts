import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

type NavigationItemUI = {
  id: number
  label: string
  href: string
  order: number
  isVisible: boolean
}

// Map Supabase fields to UI fields
function mapToUI(item: any): NavigationItemUI {
  return {
    id: item.id,
    label: item.label,
    href: item.href,
    order: item.sort_order,
    isVisible: item.is_visible ?? true,
  }
}

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: items, error } = await supabaseAdmin
    .from(Tables.navigationItems)
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Failed to fetch navigation items:", error)
    return NextResponse.json({ error: "Failed to fetch navigation items" }, { status: 500 })
  }

  return NextResponse.json((items || []).map(mapToUI))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { label, href, order, isVisible } = body

    if (!label || !href) {
      return NextResponse.json({ error: "Label and href are required" }, { status: 400 })
    }

    const { data: newItem, error } = await supabaseAdmin
      .from(Tables.navigationItems)
      .insert({
        label,
        href,
        sort_order: order || 999,
        is_visible: isVisible !== false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(mapToUI(newItem))
  } catch (error) {
    console.error("Failed to create navigation item:", error)
    return NextResponse.json({ error: "Failed to create navigation item" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { items } = body as { items: NavigationItemUI[] }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array required" }, { status: 400 })
    }

    // Update all items
    const updated = await Promise.all(
      items.map(async (item) => {
        const { data, error } = await supabaseAdmin
          .from(Tables.navigationItems)
          .update({
            label: item.label,
            href: item.href,
            sort_order: item.order,
            is_visible: item.isVisible,
          })
          .eq("id", item.id)
          .select()
          .single()

        if (error) throw error
        return data
      }),
    )

    return NextResponse.json(updated.map(mapToUI))
  } catch (error) {
    console.error("Failed to update navigation items:", error)
    return NextResponse.json({ error: "Failed to update navigation items" }, { status: 500 })
  }
}
