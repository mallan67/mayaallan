import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllEvents, createEvent } from "@/lib/mock-data"
import { z } from "zod"

const EventSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  startsAt: z.string(),
  endsAt: z.string().optional().nullable(),
  locationText: z.string().optional().nullable(),
  locationUrl: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isVisible: z.boolean().default(false),
  keepVisibleAfterEnd: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
})

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const events = await getAllEvents()
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = EventSchema.parse(body)
    const event = await createEvent(data)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
