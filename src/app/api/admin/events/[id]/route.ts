import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * EVENT API ROUTES (by ID)
 *
 * Uses Supabase Event table with camelCase columns.
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

    return NextResponse.json(event)
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

    // Build update data with camelCase columns (matching Event table)
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.startsAt !== undefined) updateData.startsAt = body.startsAt
    if (body.endsAt !== undefined) updateData.endsAt = body.endsAt || null
    if (body.locationText !== undefined) updateData.locationText = body.locationText || null
    if (body.locationUrl !== undefined) updateData.locationUrl = body.locationUrl || null
    if (body.eventImageUrl !== undefined) updateData.eventImageUrl = body.eventImageUrl || null
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished)
    if (body.isVisible !== undefined) updateData.isVisible = Boolean(body.isVisible)
    if (body.keepVisibleAfterEnd !== undefined) updateData.keepVisibleAfterEnd = Boolean(body.keepVisibleAfterEnd)
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null

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

    console.log("Event updated successfully")
    return NextResponse.json(event)
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
