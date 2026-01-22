import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: settings, error } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("*")
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Check if settings exist
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("id")
      .limit(1)
      .single()

    const settingsData = {
      site_name: data.siteName || "Maya Allan",
      tagline: data.tagline || null,
      contact_email: data.contactEmail || null,
      social_twitter: data.socialTwitter || null,
      social_instagram: data.socialInstagram || null,
      social_facebook: data.socialFacebook || null,
      social_youtube: data.socialYoutube || null,
      social_tiktok: data.socialTiktok || null,
      footer_text: data.footerText || null,
      author_name: data.authorName || null,
      author_bio: data.authorBio || null,
      author_photo_url: data.authorPhotoUrl || null,
      default_og_image_url: data.defaultOgImageUrl || null,
    }

    let settings
    if (existing && !fetchError) {
      const { data: updated, error } = await supabaseAdmin
        .from(Tables.siteSettings)
        .update(settingsData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      settings = updated
    } else {
      const { data: created, error } = await supabaseAdmin
        .from(Tables.siteSettings)
        .insert(settingsData)
        .select()
        .single()

      if (error) throw error
      settings = created
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
