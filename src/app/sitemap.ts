import type { MetadataRoute } from "next"
import { getPublishedBooks, getVisibleEvents, getVisibleMedia } from "@/lib/mock-data"

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

  // Dynamic book pages
  const books = await getPublishedBooks()
  const bookPages: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${baseUrl}/books/${book.slug}`,
    lastModified: book.updatedAt ? new Date(book.updatedAt) : currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  // Dynamic event pages
  const events = await getVisibleEvents()
  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt ? new Date(event.updatedAt) : currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Dynamic media pages
  const media = await getVisibleMedia()
  const mediaPages: MetadataRoute.Sitemap = media.map((item) => ({
    url: `${baseUrl}/media/${item.slug}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...bookPages, ...eventPages, ...mediaPages]
}
