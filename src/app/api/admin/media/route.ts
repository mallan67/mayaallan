import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllMedia, createMedia } from "@/lib/mock-data"
import { z } from "zod"

const MediaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["audio", "video"]),
  description: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  isVisible: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
})

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const media = await getAllMedia()
  return NextResponse.json(media)
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = MediaSchema.parse(body)
    const media = await createMedia(data)
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 })
  }
}
