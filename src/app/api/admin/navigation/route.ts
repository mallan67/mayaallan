import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { validateNavItemPayload } from "@/lib/nav-href-validation"

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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = validateNavItemPayload(body)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }
    const { label, href, order, isVisible } = validated.value

    const { data: newItem, error } = await supabaseAdmin
      .from(Tables.navigationItems)
      .insert({
        label,
        href,
        sort_order: order,
        is_visible: isVisible,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/", "layout")
    return NextResponse.json(mapToUI(newItem))
  } catch (error) {
    console.error("Failed to create navigation item:", error)
    return NextResponse.json({ error: "Failed to create navigation item" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

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

    // Validate every item BEFORE issuing any update — refusing the whole
    // batch on one bad row beats leaving the menu half-updated.
    const validatedItems: Array<{ id: number; label: string; href: string; order: number; isVisible: boolean }> = []
    for (const item of items) {
      const v = validateNavItemPayload(item)
      if (!v.ok) {
        return NextResponse.json({ error: v.error }, { status: 400 })
      }
      if (typeof item.id !== "number" || !Number.isInteger(item.id)) {
        return NextResponse.json({ error: "item id must be an integer" }, { status: 400 })
      }
      validatedItems.push({ id: item.id, ...v.value })
    }

    // Update all items
    const updated = await Promise.all(
      validatedItems.map(async (item) => {
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

    revalidatePath("/", "layout")
    return NextResponse.json(updated.map(mapToUI))
  } catch (error) {
    console.error("Failed to update navigation items:", error)
    return NextResponse.json({ error: "Failed to update navigation items" }, { status: 500 })
  }
}
