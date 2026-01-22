import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * MEDIA ITEM API ROUTES (by ID)
 *
 * GET - Fetch single media item
 * PUT - Update media item
 * DELETE - Delete media item
 *
 * Note: Table uses camelCase columns (coverUrl, fileUrl, etc.)
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

    // Columns are already camelCase, return as-is
    return NextResponse.json(media)
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

    // Build update data (camelCase columns)
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.kind !== undefined) updateData.kind = body.kind
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl || null
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl || null
    if (body.externalUrl !== undefined) updateData.externalUrl = body.externalUrl || null
    if (body.duration !== undefined) updateData.duration = body.duration || null
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished)
    if (body.isVisible !== undefined) updateData.isVisible = Boolean(body.isVisible)
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null
    if (body.publishedAt !== undefined) updateData.publishedAt = body.publishedAt || null

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

    return NextResponse.json(media)
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
