import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Always order by id to ensure consistent results
    const { data: settings, error } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // Log the actual error for debugging
      console.error("Supabase error fetching settings:", error.message, error.code)
      throw error
    }

    console.log("Settings loaded:", settings ? `id=${settings.id}` : "none")
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
    console.log("Saving settings - authorName:", data.authorName, "authorBio length:", data.authorBio?.length)

    // Check if settings exist - order by id for consistency
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    // SiteSettings table uses camelCase columns
    const settingsData: any = {
      siteName: data.siteName || "Maya Allan",
      tagline: data.tagline || null,
      contactEmail: data.contactEmail || null,
      socialX: data.socialX || null,
      socialInstagram: data.socialInstagram || null,
      socialFacebook: data.socialFacebook || null,
      socialYoutube: data.socialYoutube || null,
      socialTiktok: data.socialTiktok || null,
      footerText: data.footerText || null,
      authorName: data.authorName || null,
      authorBio: data.authorBio || null,
      authorPhotoUrl: data.authorPhotoUrl || null,
      defaultOgImageUrl: data.defaultOgImageUrl || null,
      siteIconUrl: data.siteIconUrl || null,
      updatedAt: new Date().toISOString(),
    }

    let settings
    if (existing && !fetchError) {
      const { data: updated, error } = await supabaseAdmin
        .from(Tables.siteSettings)
        .update(settingsData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating settings:", error.message, error.code)
        throw error
      }
      console.log("Settings updated - id:", updated?.id)
      settings = updated
    } else {
      console.log("No existing settings found, creating new...")
      const { data: created, error } = await supabaseAdmin
        .from(Tables.siteSettings)
        .insert(settingsData)
        .select()
        .single()

      if (error) {
        console.error("Error creating settings:", error.message, error.code)
        throw error
      }
      console.log("Settings created - id:", created?.id)
      settings = created
    }

    // Invalidate all cached pages that use settings
    // Use 'layout' type to ensure the entire layout tree is revalidated
    revalidatePath("/", "layout")
    revalidatePath("/about", "page")
    revalidatePath("/books", "page")
    revalidatePath("/contact", "page")

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
