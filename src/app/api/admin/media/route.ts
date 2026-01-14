import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllMedia, createMedia } from "@/lib/mock-data"
import { z } from "zod"

const MediaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),

  // UI currently sends "type" (audio|video). Model wants "kind".
  type: z.enum(["audio", "video"]),

  description: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),

  altText: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),

  isPublished: z.boolean().default(false),
  isVisible: z.boolean().default(true),

  sortOrder: z.number().optional(),
  publishedAt: z.string().optional().nullable(),
})

export async function GET(request: Request) {
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

    // 🔒 Minimal mapping: satisfy model requirement for `kind`
    const payload = {
      ...data,
      kind: data.type, // model requires `kind`, keep `type` too if the model supports it
    }

    const media = await createMedia(payload as any)
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Failed to create media" }, { status: 500 })
  }
}
