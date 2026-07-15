import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"
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
    // Always order by id to ensure consistent results.
    const [settings] = await sql`
      select * from site_settings
      order by id asc
      limit 1
    `

    // DB is snake_case (post-migration). The admin UI expects camelCase.
    // No row -> {} (the tolerated "no rows" path); a real DB error throws to
    // the catch below.
    return NextResponse.json(settings ? settingsRowToObject(settings) : {})
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// Internal: DB row (snake_case) ↔ API/admin-UI shape (camelCase).
// Mirrors the books / events pattern: snake_case in the DB, camelCase
// over the wire so existing admin UI doesn't need a rewrite.
function settingsRowToObject(row: any): Record<string, unknown> {
  return {
    id: row.id,
    siteName: row.site_name,
    tagline: row.tagline,
    contactEmail: row.contact_email,
    socialX: row.social_x,
    socialInstagram: row.social_instagram,
    socialFacebook: row.social_facebook,
    socialYoutube: row.social_youtube,
    socialTiktok: row.social_tiktok,
    footerText: row.footer_text,
    authorName: row.author_name,
    authorBio: row.author_bio,
    authorPhotoUrl: row.author_photo_url,
    defaultOgImageUrl: row.default_og_image_url,
    siteIconUrl: row.site_icon_url,
    updatedAt: row.updated_at,
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
    const [existing] = await sql`
      select id from site_settings
      order by id asc
      limit 1
    `

    // site_settings table uses snake_case columns (post-migration).
    // Map the validated camelCase input → snake_case columns.
    const settingsData: Record<string, unknown> = {
      site_name: data.siteName,
      tagline: data.tagline,
      contact_email: data.contactEmail,
      social_x: data.socialX,
      social_instagram: data.socialInstagram,
      social_facebook: data.socialFacebook,
      social_youtube: data.socialYoutube,
      social_tiktok: data.socialTiktok,
      footer_text: data.footerText,
      author_name: data.authorName,
      author_bio: data.authorBio,
      author_photo_url: data.authorPhotoUrl,
      default_og_image_url: data.defaultOgImageUrl,
      site_icon_url: data.siteIconUrl,
      updated_at: new Date().toISOString(),
    }

    let settings
    if (existing) {
      const [updated] = await sql`
        update site_settings set ${sql(settingsData)}
        where id = ${existing.id}
        returning *
      `
      settings = updated
    } else {
      const [created] = await sql`
        insert into site_settings ${sql(settingsData)}
        returning *
      `
      settings = created
    }

    // Invalidate all cached pages that use settings
    revalidatePath("/", "layout")
    revalidatePath("/about", "page")
    revalidatePath("/books", "page")
    revalidatePath("/contact", "page")

    return NextResponse.json(settingsRowToObject(settings))
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
