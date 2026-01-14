import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

type NavigationItemUI = {
  id: number
  label: string
  href: string
  order: number
  isVisible: boolean
}

// Map Prisma fields to UI fields
function mapToUI(item: any): NavigationItemUI {
  return {
    id: item.id,
    label: item.label,
    href: item.href,
    order: item.sortOrder,
    isVisible: item.isActive,
  }
}

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await prisma.navigationItem.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(items.map(mapToUI))
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

    const newItem = await prisma.navigationItem.create({
      data: {
        label,
        href,
        sortOrder: order || 999,
        isActive: isVisible !== false,
      },
    })

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
      items.map((item) =>
        prisma.navigationItem.update({
          where: { id: item.id },
          data: {
            label: item.label,
            href: item.href,
            sortOrder: item.order,
            isActive: item.isVisible,
          },
        }),
      ),
    )

    return NextResponse.json(updated.map(mapToUI))
  } catch (error) {
    console.error("Failed to update navigation items:", error)
    return NextResponse.json({ error: "Failed to update navigation items" }, { status: 500 })
  }
}
