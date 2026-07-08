import type { MetadataRoute } from "next"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { listPosts } from "@/lib/posts"
import { listScenarios } from "@/lib/scenarios"
import { LOCALES, SITE_URL, type Locale } from "@/lib/identity"
import { sitemapAlternates } from "@/lib/i18n/hreflang"
import { upcomingEventsOrClause } from "@/lib/events-visibility"

// Pages that have translated versions live. As more pages get translated, add
// their root-relative path here so the sitemap emits hreflang alternates for
// them. Google reads these to serve the right language to the right user.
const TRANSLATED_PATHS = new Set<string>(["/", "/about"])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const currentDate = new Date()
  const posts = await listPosts()
  const scenarios = await listScenarios()

  // Build a list of {path, lastModified, priority} for translated pages —
  // these need both their English entry AND per-locale entries with
  // hreflang alternates.
  const translatedLocaleEntries: MetadataRoute.Sitemap = []
  for (const path of TRANSLATED_PATHS) {
    for (const locale of LOCALES) {
      if (locale === "en") continue // English lives at the canonical path
      const url = path === "/" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`
      translatedLocaleEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: sitemapAlternates(path) },
      })
    }
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
      // hreflang alternates for the homepage — declared on the canonical
      // English entry so Google can serve the right language version.
      alternates: { languages: sitemapAlternates("/") },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: sitemapAlternates("/about") },
    },
    {
      url: `${baseUrl}/books`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
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
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refunds`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/methods`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/belief-inquiry`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reset`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integration`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/scenarios`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      // High priority — this is a hub page for the 40-scenario content
      // cluster, the highest-leverage SEO + AI-citation asset on the site.
      priority: 0.9,
    },
    {
      // FAQ page — 20 short answers to top reader queries, AI-citation
      // optimized. Same logic as scenarios: pure citation-magnet content.
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      // Glossary — canonical "what is X" reference for psilocybin +
      // integration vocabulary. DefinedTermSet schema makes this the
      // citation target for AI engines answering definition queries.
      url: `${baseUrl}/glossary`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ]

  // Scenario pages — each is an AI-citation-optimized landing page targeting
  // one specific user query. Crawled and indexed alongside everything else.
  const scenarioPages: MetadataRoute.Sitemap = scenarios.map((s) => {
    const parsed = new Date(s.dateModified ?? s.datePublished)
    const lastModified = isNaN(parsed.getTime()) ? currentDate : parsed
    return {
      url: `${baseUrl}/scenarios/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }
  })

  const blogPostPages: MetadataRoute.Sitemap = posts.map((post) => {
    const parsed = new Date(post.date)
    const lastModified = isNaN(parsed.getTime()) ? currentDate : parsed
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }
  })

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

    // Dynamic event pages — events table is canonical snake_case
    // post-migration. Past events excluded unless pinned via
    // keep_visible_after_end, same rule as /events listing. Keeps
    // Googlebot from indexing dead "Upcoming Events" links.
    const { data: events, error: eventsError } = await supabaseAdmin
      .from(Tables.events)
      .select("slug, updated_at")
      .eq("is_visible", true)
      .or(upcomingEventsOrClause())

    if (!eventsError && events) {
      eventPages = events.map((event: any) => ({
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

  return [
    ...staticPages,
    ...translatedLocaleEntries,
    ...bookPages,
    ...eventPages,
    ...mediaPages,
    ...blogPostPages,
    ...scenarioPages,
  ]
}
