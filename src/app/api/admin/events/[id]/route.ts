import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { eventUpdateSchema, formatZodError } from "@/lib/admin-schemas"
import { eventRowToObject, eventObjectToRow } from "@/lib/events-visibility"

/**
 * EVENT API ROUTES (by ID)
 *
 * Reads + writes the canonical snake_case `events` table (post the
 * 2026-05-21 reconciliation migration). Wire format stays camelCase via
 * eventRowToObject() on read and eventObjectToRow() on write.
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

    return NextResponse.json(eventRowToObject(event))
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
    const rawBody = await request.json().catch(() => ({}))
    const parsed = eventUpdateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(formatZodError(parsed.error), { status: 400 })
    }
    const input = parsed.data

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

    // Partial update against snake_case columns. eventObjectToRow maps
    // the camelCase validated input → snake_case columns, only emitting
    // keys present in `input` (preserves "field omitted = column untouched").
    const updateData: Record<string, unknown> = {
      ...eventObjectToRow(input as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    }

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

    return NextResponse.json(eventRowToObject(event))
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE event
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
    const { error } = await supabaseAdmin
      .from(Tables.events)
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      return NextResponse.json({ error: "Database delete failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
