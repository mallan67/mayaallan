import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * MEDIA API ROUTES
 *
 * Uses Supabase for persistent storage.
 * Handles audio, video, and image media items.
 */

// GET all media items
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: media, error } = await supabaseAdmin
      .from(Tables.mediaItems)
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching media:", error)
      throw error
    }

    // Map to camelCase for frontend
    const mappedMedia = (media || []).map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      kind: item.kind,
      description: item.description,
      coverUrl: item.cover_url,
      fileUrl: item.file_url,
      externalUrl: item.external_url,
      duration: item.duration,
      isPublished: item.is_published,
      isVisible: item.is_visible,
      seoTitle: item.seo_title,
      seoDescription: item.seo_description,
      publishedAt: item.published_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))

    return NextResponse.json(mappedMedia)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}

// POST create new media
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 })
    }

    // Map from camelCase to snake_case for database
    const insertData: any = {
      title: body.title,
      slug: body.slug,
      kind: body.type || body.kind || "audio", // Frontend sends "type", we store as "kind"
      description: body.description || null,
      cover_url: body.coverUrl || null,
      file_url: body.fileUrl || null,
      external_url: body.externalUrl || null,
      duration: body.duration || null,
      is_published: body.isPublished ?? false,
      is_visible: body.isVisible ?? false,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      published_at: body.publishedAt || null,
    }

    const { data: media, error } = await supabaseAdmin
      .from(Tables.mediaItems)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A media item with this slug already exists" },
          { status: 409 }
        )
      }
      console.error("Error creating media:", error)
      throw error
    }

    // Map to camelCase for frontend response
    const mappedMedia = {
      id: media.id,
      slug: media.slug,
      title: media.title,
      kind: media.kind,
      description: media.description,
      coverUrl: media.cover_url,
      fileUrl: media.file_url,
      externalUrl: media.external_url,
      duration: media.duration,
      isPublished: media.is_published,
      isVisible: media.is_visible,
      seoTitle: media.seo_title,
      seoDescription: media.seo_description,
      publishedAt: media.published_at,
      createdAt: media.created_at,
      updatedAt: media.updated_at,
    }

    return NextResponse.json(mappedMedia, { status: 201 })
  } catch (error) {
    console.error("Error creating media:", error)
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 })
  }
}
