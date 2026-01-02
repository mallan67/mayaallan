import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mayaallan.com"
  const currentDate = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  let bookPages: MetadataRoute.Sitemap = []
  let eventPages: MetadataRoute.Sitemap = []
  let mediaPages: MetadataRoute.Sitemap = []

  try {
    // Dynamic book pages - fetch published and visible books from Prisma
    const books = await prisma.book.findMany({
      where: {
        isPublished: true,
        isVisible: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    bookPages = books.map((book) => ({
      url: `${baseUrl}/books/${book.slug}`,
      lastModified: book.updatedAt || currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

    // Dynamic event pages - fetch visible events from Prisma
    const events = await prisma.event.findMany({
      where: {
        isVisible: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    eventPages = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    // Dynamic media pages - fetch visible media from Prisma
    const media = await prisma.mediaItem.findMany({
      where: {
        isVisible: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    mediaPages = media.map((item) => ({
      url: `${baseUrl}/media/${item.slug}`,
      lastModified: item.updatedAt || currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  } catch (error) {
    // During build or if DB unavailable, just use static pages
    console.warn("Sitemap dynamic content fetch failed:", error)
  }

  return [...staticPages, ...bookPages, ...eventPages, ...mediaPages]
}
