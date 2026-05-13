import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"

/**
 * Validation rules for the settings payload.
 *
 * Strings: trimmed at the schema layer. Empty strings after trim are
 * converted to `null` before persisting so the DB doesn't accumulate
 * "" rows that downstream UI has to treat as null anyway.
 *
 * URL fields are required to be https:// — http://, data:, javascript:,
 * and protocol-relative URLs all fail the parse. Plain hostnames without
 * a scheme also fail (z.string().url() requires a parseable scheme).
 */
function emptyToNull(s: string | null | undefined): string | null {
  if (typeof s !== "string") return null
  const trimmed = s.trim()
  return trimmed.length === 0 ? null : trimmed
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "https:"
  } catch {
    return false
  }
}

const optionalHttpsUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform(emptyToNull)
  .refine((v) => v === null || isHttpsUrl(v), {
    message: "must be an https:// URL",
  })

const optionalString = (maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform(emptyToNull)
    .refine((v) => v === null || v.length <= maxLength, {
      message: `must be ${maxLength} characters or fewer`,
    })

const optionalEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform(emptyToNull)
  .refine(
    (v) => {
      if (v === null) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254
    },
    { message: "must be a valid email" },
  )

const SettingsSchema = z.object({
  // siteName falls back to "Maya Allan" if missing/blank
  siteName: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      const trimmed = typeof v === "string" ? v.trim() : ""
      return trimmed || "Maya Allan"
    })
    .refine((v) => v.length <= 120, { message: "siteName too long" }),

  tagline: optionalString(280),
  contactEmail: optionalEmail,
  socialX: optionalHttpsUrl,
  socialInstagram: optionalHttpsUrl,
  socialFacebook: optionalHttpsUrl,
  socialYoutube: optionalHttpsUrl,
  socialTiktok: optionalHttpsUrl,
  footerText: optionalString(500),
  authorName: optionalString(120),
  authorBio: optionalString(2000),
  authorPhotoUrl: optionalHttpsUrl,
  defaultOgImageUrl: optionalHttpsUrl,
  siteIconUrl: optionalHttpsUrl,
})

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
      console.error("Supabase error fetching settings:", error.message, error.code)
      throw error
    }

    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const raw = await request.json().catch(() => null)
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const parsed = SettingsSchema.safeParse(raw)
    if (!parsed.success) {
      // Return generic validation errors without leaking field internals.
      // The admin UI knows the field names — it can map back if needed.
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        {
          error: "Invalid settings",
          field: firstIssue?.path.join(".") || undefined,
          message: firstIssue?.message,
        },
        { status: 400 },
      )
    }

    const data = parsed.data

    // Check if settings exist - order by id for consistency
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from(Tables.siteSettings)
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .single()

    // SiteSettings table uses camelCase columns. Spread the validated
    // values directly — emptyToNull has already converted "" to null.
    const settingsData: Record<string, unknown> = {
      siteName: data.siteName,
      tagline: data.tagline,
      contactEmail: data.contactEmail,
      socialX: data.socialX,
      socialInstagram: data.socialInstagram,
      socialFacebook: data.socialFacebook,
      socialYoutube: data.socialYoutube,
      socialTiktok: data.socialTiktok,
      footerText: data.footerText,
      authorName: data.authorName,
      authorBio: data.authorBio,
      authorPhotoUrl: data.authorPhotoUrl,
      defaultOgImageUrl: data.defaultOgImageUrl,
      siteIconUrl: data.siteIconUrl,
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
      settings = updated
    } else {
      const { data: created, error } = await supabaseAdmin
        .from(Tables.siteSettings)
        .insert(settingsData)
        .select()
        .single()

      if (error) {
        console.error("Error creating settings:", error.message, error.code)
        throw error
      }
      settings = created
    }

    // Invalidate all cached pages that use settings
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
