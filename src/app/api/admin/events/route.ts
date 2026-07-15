import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { sql } from "@/lib/db"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { eventCreateSchema, formatZodError } from "@/lib/admin-schemas"
import { eventRowToObject } from "@/lib/events-visibility"

/**
 * EVENTS API ROUTES
 *
 * Reads + writes the canonical snake_case `events` table (post the
 * 2026-05-21 table reconciliation migration). The wire format (request
 * body + response body) stays camelCase — eventRowToObject() converts
 * each row before sending it out, matching the established `books`
 * pattern in the codebase.
 */

// GET all events
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const events = await sql`
      select * from events
      order by starts_at desc
    `

    return NextResponse.json(
      events.map((row) => eventRowToObject(row as Record<string, unknown>)),
    )
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

    // Events table uses snake_case columns. Validated input (camelCase
    // from the admin form) maps to snake_case columns explicitly.
    const now = new Date().toISOString()
    const insertData = {
      title: input.title,
      slug: input.slug,
      description: input.description,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      location_text: input.locationText,
      location_url: input.locationUrl,
      event_image_url: input.eventImageUrl,
      is_published: input.isPublished,
      is_visible: input.isVisible,
      keep_visible_after_end: input.keepVisibleAfterEnd,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      created_at: now,
      updated_at: now,
    }

    let event
    try {
      const [inserted] = await sql`insert into events ${sql(insertData)} returning *`
      event = inserted
    } catch (dbError) {
      const code = (dbError as { code?: string })?.code
      console.error("Error creating event:", code, dbError instanceof Error ? dbError.message : String(dbError))
      if (code === "23505") {
        return NextResponse.json(
          { error: "An event with this slug already exists" },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 })
    }

    return NextResponse.json(eventRowToObject(event as Record<string, unknown>), { status: 201 })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
