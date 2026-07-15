import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"

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
    const retailers = await sql`
      select id, name, slug, icon_url, is_active
      from retailers
      order by name asc
    `

    // Map to camelCase for frontend
    const mappedRetailers = retailers.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      iconUrl: r.icon_url,
      isActive: r.is_active,
    }))

    return NextResponse.json(mappedRetailers)
  } catch (error) {
    console.error("Error fetching retailers:", error)
    return NextResponse.json(
      { error: "Failed to fetch retailers" },
      { status: 500 }
    )
  }
}
