import type { MetadataRoute } from "next"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.mayaallan.com"
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
    // Dynamic book pages - fetch published and visible books from Supabase
    const { data: books, error: booksError } = await supabaseAdmin
      .from(Tables.books)
      .select("slug, updated_at")
      .eq("is_published", true)
      .eq("is_visible", true)

    if (!booksError && books) {
      bookPages = books.map((book) => ({
        url: `${baseUrl}/books/${book.slug}`,
        lastModified: book.updated_at ? new Date(book.updated_at) : currentDate,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    }

    // Dynamic event pages - fetch visible events from Supabase
    const { data: events, error: eventsError } = await supabaseAdmin
      .from(Tables.events)
      .select("slug, updated_at")
      .eq("is_visible", true)

    if (!eventsError && events) {
      eventPages = events.map((event) => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: event.updated_at ? new Date(event.updated_at) : currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    }

    // Dynamic media pages - fetch visible media from Supabase
    const { data: media, error: mediaError } = await supabaseAdmin
      .from(Tables.mediaItems)
      .select("slug, updated_at")
      .eq("is_visible", true)

    if (!mediaError && media) {
      mediaPages = media.map((item) => ({
        url: `${baseUrl}/media/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : currentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    // During build or if DB unavailable, just use static pages
    console.warn("Sitemap dynamic content fetch failed:", error)
  }

  return [...staticPages, ...bookPages, ...eventPages, ...mediaPages]
}
