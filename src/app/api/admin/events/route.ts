import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { eventCreateSchema, formatZodError } from "@/lib/admin-schemas"

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
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rawBody = await request.json().catch(() => ({}))
    const parsed = eventCreateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(formatZodError(parsed.error), { status: 400 })
    }
    const input = parsed.data

    // Event table uses camelCase columns. Validated input passes through
    // 1:1 (the schema already coerced + trimmed values).
    const now = new Date().toISOString()
    const insertData = {
      title: input.title,
      slug: input.slug,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      locationText: input.locationText,
      locationUrl: input.locationUrl,
      eventImageUrl: input.eventImageUrl,
      isPublished: input.isPublished,
      isVisible: input.isVisible,
      keepVisibleAfterEnd: input.keepVisibleAfterEnd,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      createdAt: now,
      updatedAt: now,
    }

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
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
