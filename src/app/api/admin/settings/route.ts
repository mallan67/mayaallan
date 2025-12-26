import { NextResponse } from "next/server"
import { z } from "zod"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const UpdateSettingsSchema = z.object({
  siteName: z.string().optional(),
  tagline: z.string().optional(),
  footerText: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  socialTwitter: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialYoutube: z.string().optional(),
  socialTiktok: z.string().optional(),
  authorName: z.string().optional(),
  authorBio: z.string().optional(),
  authorPhotoUrl: z.string().optional(),
  defaultOgImageUrl: z.string().optional(),
})

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.siteSettings.findFirst()
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = UpdateSettingsSchema.parse(body)

    // Ensure single row exists (id=1)
    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        siteName: data.siteName || "Maya Allan",
        tagline: data.tagline || null,
        footerText: data.footerText || null,
        contactEmail: data.contactEmail ? data.contactEmail : null,
        socialTwitter: data.socialTwitter || null,
        socialInstagram: data.socialInstagram || null,
        socialFacebook: data.socialFacebook || null,
        socialYoutube: data.socialYoutube || null,
        socialTiktok: data.socialTiktok || null,
        authorName: data.authorName || null,
        authorBio: data.authorBio || null,
        authorPhotoUrl: data.authorPhotoUrl || null,
        defaultOgImageUrl: data.defaultOgImageUrl || null,
      },
      update: {
        siteName: data.siteName ?? undefined,
        tagline: data.tagline ?? undefined,
        footerText: data.footerText ?? undefined,
        contactEmail: data.contactEmail === "" ? null : data.contactEmail ?? undefined,
        socialTwitter: data.socialTwitter ?? undefined,
        socialInstagram: data.socialInstagram ?? undefined,
        socialFacebook: data.socialFacebook ?? undefined,
        socialYoutube: data.socialYoutube ?? undefined,
        socialTiktok: data.socialTiktok ?? undefined,
        authorName: data.authorName ?? undefined,
        authorBio: data.authorBio ?? undefined,
        authorPhotoUrl: data.authorPhotoUrl ?? undefined,
        defaultOgImageUrl: data.defaultOgImageUrl ?? undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
