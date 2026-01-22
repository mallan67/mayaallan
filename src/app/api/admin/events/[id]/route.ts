import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * EVENT API ROUTES (by ID)
 *
 * Uses Supabase events table with snake_case columns.
 */

// GET single event by ID
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
    const { data: event, error } = await supabaseAdmin
      .from(Tables.events)
      .select("*")
      .eq("id", id)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Map snake_case to camelCase
    const mappedEvent = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      locationText: event.location_text,
      locationUrl: event.location_url,
      eventImageUrl: event.event_image_url || event.og_image_url,
      isPublished: event.is_published ?? false,
      isVisible: event.is_visible ?? false,
      keepVisibleAfterEnd: event.keep_visible_after_end ?? false,
      seoTitle: event.seo_title,
      seoDescription: event.seo_description,
      ogImageUrl: event.og_image_url,
      createdAt: event.created_at,
    }

    return NextResponse.json(mappedEvent)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT update event
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
    console.log("Event PUT - ID:", id, "Body:", JSON.stringify(body))

    // Verify event exists
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from(Tables.events)
      .select("id")
      .eq("id", id)
      .single()

    if (fetchError || !existingEvent) {
      console.error("Event not found:", fetchError)
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Build update data with snake_case columns
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.startsAt !== undefined) updateData.starts_at = body.startsAt
    if (body.endsAt !== undefined) updateData.ends_at = body.endsAt || null
    if (body.locationText !== undefined) updateData.location_text = body.locationText || null
    if (body.locationUrl !== undefined) updateData.location_url = body.locationUrl || null
    if (body.eventImageUrl !== undefined) updateData.event_image_url = body.eventImageUrl || null
    if (body.isPublished !== undefined) updateData.is_published = Boolean(body.isPublished)
    if (body.isVisible !== undefined) updateData.is_visible = Boolean(body.isVisible)
    if (body.keepVisibleAfterEnd !== undefined) updateData.keep_visible_after_end = Boolean(body.keepVisibleAfterEnd)
    if (body.seoTitle !== undefined) updateData.seo_title = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seo_description = body.seoDescription || null
    if (body.ogImageUrl !== undefined) updateData.og_image_url = body.ogImageUrl || null

    console.log("Update data:", updateData)

    const { data: event, error: updateError } = await supabaseAdmin
      .from(Tables.events)
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating event:", updateError)
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "An event with this slug already exists" },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Map response back to camelCase
    const mappedEvent = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      locationText: event.location_text,
      locationUrl: event.location_url,
      eventImageUrl: event.event_image_url,
      isPublished: event.is_published,
      isVisible: event.is_visible,
      keepVisibleAfterEnd: event.keep_visible_after_end,
      createdAt: event.created_at,
    }

    console.log("Event updated successfully")
    return NextResponse.json(mappedEvent)
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 })
  }
}

// DELETE event
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
      .from(Tables.events)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 })
  }
}
