import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getMediaById, updateMedia, deleteMedia } from "@/lib/mock-data"
import { z } from "zod"

const UpdateMediaSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  type: z.enum(["audio", "video"]).optional(),
  description: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const media = await getMediaById(id)
  
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 })
  }
  
  return NextResponse.json(media)
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
    const data = UpdateMediaSchema.parse(body)
    const media = await updateMedia(id, data)
    
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }
    
    return NextResponse.json(media)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 })
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
  const success = await deleteMedia(id)
  
  if (!success) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 })
  }
  
  return NextResponse.json({ ok: true })
}
