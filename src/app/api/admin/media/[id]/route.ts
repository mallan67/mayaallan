import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * MEDIA ITEM API ROUTES (by ID)
 *
 * GET - Fetch single media item
 * PUT - Update media item
 * DELETE - Delete media item
 */

// GET single media item by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idParam } = await params
  const id = parseInt(idParam)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const { data: media, error } = await supabaseAdmin
      .from(Tables.mediaItems)
      .select("*")
      .eq("id", id)
      .single()

    if (error || !media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Map to camelCase for frontend
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

    return NextResponse.json(mappedMedia)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}

// PUT update media item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idParam } = await params
  const id = parseInt(idParam)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Verify media exists
    const { data: existingMedia, error: fetchError } = await supabaseAdmin
      .from(Tables.mediaItems)
      .select("id")
      .eq("id", id)
      .single()

    if (fetchError || !existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Build update data (only include provided fields)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.kind !== undefined) updateData.kind = body.kind
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.coverUrl !== undefined) updateData.cover_url = body.coverUrl || null
    if (body.fileUrl !== undefined) updateData.file_url = body.fileUrl || null
    if (body.externalUrl !== undefined) updateData.external_url = body.externalUrl || null
    if (body.duration !== undefined) updateData.duration = body.duration || null
    if (body.isPublished !== undefined) updateData.is_published = Boolean(body.isPublished)
    if (body.isVisible !== undefined) updateData.is_visible = Boolean(body.isVisible)
    if (body.seoTitle !== undefined) updateData.seo_title = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seo_description = body.seoDescription || null
    if (body.publishedAt !== undefined) updateData.published_at = body.publishedAt || null

    // Debug logging
    console.log("Media update - coverUrl received:", body.coverUrl)
    console.log("Media update - cover_url to save:", updateData.cover_url)

    const { data: media, error: updateError } = await supabaseAdmin
      .from(Tables.mediaItems)
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A media item with this slug already exists" },
          { status: 409 }
        )
      }
      console.error("Error updating media:", updateError)
      throw updateError
    }

    // Map to camelCase for frontend
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

    return NextResponse.json(mappedMedia)
  } catch (error: any) {
    console.error("Error updating media:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update media" },
      { status: 500 }
    )
  }
}

// DELETE media item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idParam } = await params
  const id = parseInt(idParam)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from(Tables.mediaItems)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting media:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting media:", error)
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
  }
}
