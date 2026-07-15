import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Was: .from(site_settings).select("site_icon_url").limit(1).single()
    // wrapped in try/catch that treats "no row" as null — preserved here.
    const [settings] = await sql`
      select site_icon_url from site_settings limit 1
    `

    if (settings?.site_icon_url) {
      return NextResponse.json({ iconUrl: settings.site_icon_url })
    }

    return NextResponse.json({ iconUrl: null })
  } catch {
    return NextResponse.json({ iconUrl: null })
  }
}
