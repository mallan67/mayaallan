import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAllNavigationItems, updateNavigationItem, createNavigationItem, type NavigationItem } from "@/lib/mock-data"

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await getAllNavigationItems()
  return NextResponse.json(items)
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

    const newItem = await createNavigationItem({
      label,
      href,
      order: order || 999,
      isVisible: isVisible !== false,
    })

    return NextResponse.json(newItem)
  } catch (error) {
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
    const { items } = body as { items: NavigationItem[] }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items array required" }, { status: 400 })
    }

    // Update all items
    const updated = await Promise.all(
      items.map((item) =>
        updateNavigationItem(item.id, {
          label: item.label,
          href: item.href,
          order: item.order,
          isVisible: item.isVisible,
        }),
      ),
    )

    return NextResponse.json(updated.filter(Boolean))
  } catch (error) {
    return NextResponse.json({ error: "Failed to update navigation items" }, { status: 500 })
  }
}
