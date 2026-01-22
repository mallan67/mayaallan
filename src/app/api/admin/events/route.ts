import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * EVENTS API ROUTES
 *
 * Uses Supabase Event table with camelCase columns.
 */

// GET all events
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: events, error } = await supabaseAdmin
      .from(Tables.events)
      .select("*")
      .order("startsAt", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
      throw error
    }

    return NextResponse.json(events || [])
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST create new event
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 })
    }

    if (!body.startsAt) {
      return NextResponse.json({ error: "Start date/time is required" }, { status: 400 })
    }

    // Event table uses camelCase columns
    const now = new Date().toISOString()
    const insertData: any = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      startsAt: body.startsAt,
      endsAt: body.endsAt || null,
      locationText: body.locationText || null,
      locationUrl: body.locationUrl || null,
      eventImageUrl: body.eventImageUrl || null,
      isPublished: body.isPublished ?? false,
      isVisible: body.isVisible ?? false,
      keepVisibleAfterEnd: body.keepVisibleAfterEnd ?? false,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      createdAt: now,
      updatedAt: now,
    }

    console.log("Creating event with data:", insertData)

    const { data: event, error } = await supabaseAdmin
      .from(Tables.events)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Error creating event:", error)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An event with this slug already exists" },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Event created successfully:", event)
    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 })
  }
}
