import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateMedia, deleteMedia } from "@/lib/mock-data"
import { z } from "zod"

const MediaUpdateSchema = z.object({
  kind: z.enum(["audio", "video"]).optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
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
    const data = MediaUpdateSchema.parse(body)
    const media = await updateMedia(Number(id), data)

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteMedia(Number(id))

  if (!success) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
