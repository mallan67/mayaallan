import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    const existing = await prisma.siteSettings.findFirst()
    
    let settings
    if (existing) {
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: {
          siteName: data.siteName || null,
          tagline: data.tagline || null,
          contactEmail: data.contactEmail || null,
          socialTwitter: data.socialTwitter || null,
          socialInstagram: data.socialInstagram || null,
          socialFacebook: data.socialFacebook || null,
          socialYoutube: data.socialYoutube || null,
          socialTiktok: data.socialTiktok || null,
        },
      })
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: data.siteName || null,
          tagline: data.tagline || null,
          contactEmail: data.contactEmail || null,
          socialTwitter: data.socialTwitter || null,
          socialInstagram: data.socialInstagram || null,
          socialFacebook: data.socialFacebook || null,
          socialYoutube: data.socialYoutube || null,
          socialTiktok: data.socialTiktok || null,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
