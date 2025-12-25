import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateEvent, deleteEvent } from "@/lib/mock-data"
import { z } from "zod"

const EventUpdateSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional().nullable(),
  locationText: z.string().optional().nullable(),
  locationUrl: z.string().optional().nullable(),
  photoUrls: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  keepVisibleAfterEnd: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const data = EventUpdateSchema.parse(body)
    const event = await updateEvent(Number(id), data)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteEvent(Number(id))

  if (!success) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
