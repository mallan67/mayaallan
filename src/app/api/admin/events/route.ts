import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * EVENTS API ROUTES
 *
 * Uses Supabase events table with snake_case columns.
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
      .order("starts_at", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
      throw error
    }

    // Map snake_case to camelCase for frontend
    const mappedEvents = (events || []).map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      startsAt: item.starts_at,
      endsAt: item.ends_at,
      locationText: item.location_text,
      locationUrl: item.location_url,
      eventImageUrl: item.event_image_url || item.og_image_url,
      isPublished: item.is_published ?? false,
      isVisible: item.is_visible ?? false,
      keepVisibleAfterEnd: item.keep_visible_after_end ?? false,
      seoTitle: item.seo_title,
      seoDescription: item.seo_description,
      ogImageUrl: item.og_image_url,
      createdAt: item.created_at,
    }))

    return NextResponse.json(mappedEvents)
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

    // Map camelCase to snake_case for database
    const insertData: any = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      starts_at: body.startsAt,
      ends_at: body.endsAt || null,
      location_text: body.locationText || null,
      location_url: body.locationUrl || null,
      event_image_url: body.eventImageUrl || null,
      is_published: body.isPublished ?? false,
      is_visible: body.isVisible ?? false,
      keep_visible_after_end: body.keepVisibleAfterEnd ?? false,
      seo_title: body.seoTitle || null,
      seo_description: body.seoDescription || null,
      og_image_url: body.ogImageUrl || body.eventImageUrl || null,
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

    console.log("Event created successfully:", mappedEvent)
    return NextResponse.json(mappedEvent, { status: 201 })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 })
  }
}
