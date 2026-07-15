import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"
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

  try {
    const items = await sql`
      select * from navigation_items
      order by sort_order asc
    `
    return NextResponse.json(items.map(mapToUI))
  } catch (error) {
    console.error("Failed to fetch navigation items:", error)
    return NextResponse.json({ error: "Failed to fetch navigation items" }, { status: 500 })
  }
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

    const [newItem] = await sql`
      insert into navigation_items (label, href, sort_order, is_visible)
      values (${label}, ${href}, ${order}, ${isVisible})
      returning *
    `

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
        const [row] = await sql`
          update navigation_items
          set label = ${item.label}, href = ${item.href},
              sort_order = ${item.order}, is_visible = ${item.isVisible}
          where id = ${item.id}
          returning *
        `
        return row
      }),
    )

    revalidatePath("/", "layout")
    return NextResponse.json(updated.map(mapToUI))
  } catch (error) {
    console.error("Failed to update navigation items:", error)
    return NextResponse.json({ error: "Failed to update navigation items" }, { status: 500 })
  }
}
