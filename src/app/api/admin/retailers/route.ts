import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

/**
 * RETAILERS API (Admin)
 *
 * GET: Returns all retailer records for admin UI selection/toggles
 */

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const retailers = await prisma.retailer.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        isActive: true,
      },
    })

    return NextResponse.json(retailers)
  } catch (error) {
    console.error("Error fetching retailers:", error)
    return NextResponse.json(
      { error: "Failed to fetch retailers" },
      { status: 500 }
    )
  }
}
