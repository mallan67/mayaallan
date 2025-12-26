import { NextResponse } from "next/server"
import { z } from "zod"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const UpdateSettingsSchema = z.object({
  siteTitle: z.string().optional(),
  siteDescription: z.string().optional(),
  authorName: z.string().optional(),
  authorBio: z.string().optional(),
  authorPhotoUrl: z.string().optional(),
  defaultOgImageUrl: z.string().optional(),
  fontBody: z.string().optional(),
  fontHeading: z.string().optional(),
  accentColor: z.string().optional(),
  maxWidth: z.string().optional(),
  buttonStyle: z.string().optional(),
})

async function getOrCreateSettings() {
  const existing = await prisma.siteSettings.findFirst()
  if (existing) return existing

  return prisma.siteSettings.create({
    data: {
      siteTitle: "Maya Allan",
      siteDescription: "",
      authorName: "Maya Allan",
      authorBio: "",
      authorPhotoUrl: "",
      defaultOgImageUrl: "",
      fontBody: "serif",
      fontHeading: "serif",
      accentColor: "#0f172a",
      maxWidth: "max-w-6xl",
      buttonStyle: "rounded",
    },
  })
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await getOrCreateSettings()
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = UpdateSettingsSchema.parse(body)

    const settings = await getOrCreateSettings()

    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        siteTitle: data.siteTitle ?? settings.siteTitle,
        siteDescription: data.siteDescription ?? settings.siteDescription,
        authorName: data.authorName ?? settings.authorName,
        authorBio: data.authorBio ?? settings.authorBio,
        authorPhotoUrl: data.authorPhotoUrl ?? settings.authorPhotoUrl,
        defaultOgImageUrl: data.defaultOgImageUrl ?? settings.defaultOgImageUrl,
        fontBody: data.fontBody ?? settings.fontBody,
        fontHeading: data.fontHeading ?? settings.fontHeading,
        accentColor: data.accentColor ?? settings.accentColor,
        maxWidth: data.maxWidth ?? settings.maxWidth,
        buttonStyle: data.buttonStyle ?? settings.buttonStyle,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
