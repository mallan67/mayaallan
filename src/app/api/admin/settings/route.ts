import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getSiteSettings, updateSiteSettings } from "@/lib/mock-data"
import { z } from "zod"

const settingsSchema = z.object({
  siteTitle: z.string().optional(),
  siteDescription: z.string().optional(),
  authorPhotoUrl: z.string().optional().nullable(),
  defaultOgImageUrl: z.string().optional().nullable(),
  fontBody: z.string().optional(),
  fontHeading: z.string().optional(),
  accentColor: z.string().optional(),
  maxWidth: z.string().optional(),
  buttonStyle: z.string().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await getSiteSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = settingsSchema.parse(body)
    const settings = await updateSiteSettings(data)
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
