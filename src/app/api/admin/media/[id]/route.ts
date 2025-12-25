import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllMedia, updateMedia, deleteMedia } from "@/lib/mock-data"
import { z } from "zod"

const UpdateMediaSchema = z.object({
  type: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
  coverImage: z.string().optional(),
  isbn: z.string().optional(),
  published: z.boolean().optional(),
  visible: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const allMedia = await getAllMedia()
  const media = allMedia.find((m: any) => m.id === Number(id))

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 })
  }

  return NextResponse.json(media)
}

export async function PUT(
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

    const media = await updateMedia(Number(id), data)

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
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
  const success = await deleteMedia(Number(id))

  if (!success) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
