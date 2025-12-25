import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getEventById, updateEvent, deleteEvent } from "@/lib/mock-data"
import { z } from "zod"

const UpdateEventSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional().nullable(),
  locationText: z.string().optional().nullable(),
  locationUrl: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  keepVisibleAfterEnd: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const event = await getEventById(id)
  
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
  
  return NextResponse.json(event)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  
  try {
    const body = await request.json()
    const data = UpdateEventSchema.parse(body)
    const event = await updateEvent(id, data)
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    
    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteEvent(id)
  
  if (!success) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
  
  return NextResponse.json({ ok: true })
}
