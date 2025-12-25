import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getSiteSettings, updateSiteSettings } from "@/lib/mock-data"
import { z } from "zod"

const UpdateSettingsSchema = z.object({
  siteTitle: z.string().optional(),
  siteDescription: z.string().optional(),
  authorName: z.string().optional(),
  authorBio: z.string().optional(),
  authorPhotoUrl: z.string().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  contactEmail: z.string().email().optional(),
  analyticsId: z.string().optional(),
  defaultSeoTitle: z.string().optional(),
  defaultSeoDescription: z.string().optional(),
  defaultOgImageUrl: z.string().optional(),
})

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await getSiteSettings()
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = UpdateSettingsSchema.parse(body)
    const settings = await updateSiteSettings(data)
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
