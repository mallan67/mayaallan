import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Was: .from(site_settings).select("site_icon_url").limit(1).single()
    // wrapped in try/catch that treats "no row" as 404 — preserved here
    // (a missing row simply yields an undefined `settings`).
    const [settings] = await sql`
      select site_icon_url from site_settings limit 1
    `

    if (settings?.site_icon_url) {
      // Redirect to the uploaded icon
      return NextResponse.redirect(settings.site_icon_url)
    }

    // Return a default response if no icon is set
    return new NextResponse(null, { status: 404 })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
