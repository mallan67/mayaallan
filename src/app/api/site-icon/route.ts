import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const { data: settings } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("site_icon_url")
      .limit(1)
      .single()

    if (settings?.site_icon_url) {
      return NextResponse.json({ iconUrl: settings.site_icon_url })
    }

    return NextResponse.json({ iconUrl: null })
  } catch (error) {
    return NextResponse.json({ iconUrl: null })
  }
}
