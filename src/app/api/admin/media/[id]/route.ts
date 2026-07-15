import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"

/**
 * MEDIA ITEM API ROUTES (by ID)
 *
 * Uses Supabase media_items table with snake_case columns.
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
    const [media] = await sql`select * from media_items where id = ${id} limit 1`

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Map snake_case to camelCase
    const mappedMedia = {
      id: media.id,
      slug: media.slug,
      title: media.title,
      kind: media.kind || "audio",
      description: media.description,
      coverUrl: media.cover_url,
      fileUrl: media.file_url,
      externalUrl: media.external_url,
      duration: media.duration,
      isPublished: media.is_published ?? media.is_visible ?? false,
      isVisible: media.is_visible ?? false,
      seoTitle: media.seo_title,
      seoDescription: media.seo_description,
      publishedAt: media.published_at || media.published_date,
      createdAt: media.created_at,
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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

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
    const [existingMedia] = await sql`select id from media_items where id = ${id} limit 1`

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Build update data with snake_case columns
    const updateData: any = {}

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

    let media
    try {
      const [row] = await sql`
        update media_items set ${sql(updateData)}
        where id = ${id}
        returning *
      `
      media = row
    } catch (updateErr) {
      const code = (updateErr as { code?: string })?.code
      console.error("Error updating media:", updateErr)
      if (code === "23505") {
        return NextResponse.json(
          { error: "A media item with this slug already exists" },
          { status: 409 }
        )
      }
      // Preserve original behavior: surface the DB error message on 500.
      return NextResponse.json(
        { error: updateErr instanceof Error ? updateErr.message : "Database update failed" },
        { status: 500 },
      )
    }

    // Map response back to camelCase
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
      publishedAt: media.published_at,
      createdAt: media.created_at,
    }

    return NextResponse.json(mappedMedia)
  } catch (error: any) {
    console.error("Error updating media:", error)
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 })
  }
}

// DELETE media item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idParam } = await params
  const id = parseInt(idParam)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    try {
      await sql`delete from media_items where id = ${id}`
    } catch (delErr) {
      console.error("Error deleting media:", delErr)
      return NextResponse.json({ error: "Database delete failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting media:", error)
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
  }
}
