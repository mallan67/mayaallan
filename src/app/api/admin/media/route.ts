import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * MEDIA API ROUTES
 *
 * Uses Supabase for persistent storage.
 * Handles audio, video, and image media items.
 *
 * Note: Table uses camelCase columns (coverUrl, fileUrl, etc.)
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
      .order("createdAt", { ascending: false })

    if (error) {
      console.error("Error fetching media:", error)
      throw error
    }

    // Columns are already camelCase, return as-is
    return NextResponse.json(media || [])
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

    // Table uses camelCase columns
    const insertData: any = {
      title: body.title,
      slug: body.slug,
      kind: body.type || body.kind || "audio",
      description: body.description || null,
      coverUrl: body.coverUrl || null,
      fileUrl: body.fileUrl || null,
      externalUrl: body.externalUrl || null,
      duration: body.duration || null,
      isPublished: body.isPublished ?? false,
      isVisible: body.isVisible ?? false,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      publishedAt: body.publishedAt || null,
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

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error("Error creating media:", error)
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 })
  }
}
