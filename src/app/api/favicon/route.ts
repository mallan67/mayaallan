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
      // Redirect to the uploaded icon
      return NextResponse.redirect(settings.site_icon_url)
    }

    // Return a default response if no icon is set
    return new NextResponse(null, { status: 404 })
  } catch (error) {
    return new NextResponse(null, { status: 404 })
  }
}
