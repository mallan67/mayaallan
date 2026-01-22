import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const { data: settings } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("siteIconUrl")
      .limit(1)
      .single()

    if (settings?.siteIconUrl) {
      return NextResponse.json({ iconUrl: settings.siteIconUrl })
    }

    return NextResponse.json({ iconUrl: null })
  } catch (error) {
    return NextResponse.json({ iconUrl: null })
  }
}
