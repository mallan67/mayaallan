import type { MetadataRoute } from "next"
import { sql } from "@/lib/db"
import { listPosts } from "@/lib/posts"
import { listScenarios } from "@/lib/scenarios"
import { LOCALES, SITE_URL } from "@/lib/identity"
import { sitemapAlternates } from "@/lib/i18n/hreflang"

// Pages that have translated versions live. As more pages get translated, add
// their root-relative path here so the sitemap emits hreflang alternates for
// them. Google reads these to serve the right language to the right user.
const TRANSLATED_PATHS = new Set<string>(["/", "/about"])

function validDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const posts = await listPosts()
  const scenarios = await listScenarios()

  // Translated pages get both their own URL and reciprocal hreflang alternates.
  // Do not invent a lastModified date: only content-backed dates are emitted.
  const translatedLocaleEntries: MetadataRoute.Sitemap = []
  for (const path of TRANSLATED_PATHS) {
    for (const locale of LOCALES) {
      if (locale === "en") continue // English lives at the canonical path
      const url = path === "/" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`
      translatedLocaleEntries.push({
        url,
        alternates: { languages: sitemapAlternates(path) },
      })
    }
  }

  // Static pages. `lastModified` is intentionally omitted because these routes
  // do not currently expose a reliable content revision timestamp. Emitting the
  // request time made every page look freshly changed on every sitemap render.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      alternates: { languages: sitemapAlternates("/") },
    },
    {
      url: `${baseUrl}/about`,
      alternates: { languages: sitemapAlternates("/about") },
    },
    { url: `${baseUrl}/books` },
    { url: `${baseUrl}/events` },
    { url: `${baseUrl}/media` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/legal` },
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/terms` },
    { url: `${baseUrl}/refunds` },
    { url: `${baseUrl}/practices` },
    { url: `${baseUrl}/methods` },
    { url: `${baseUrl}/belief-inquiry` },
    { url: `${baseUrl}/nervous-system-reset` },
    { url: `${baseUrl}/integration-reflection` },
    { url: `${baseUrl}/integration-journal` },
    { url: `${baseUrl}/blog` },
    { url: `${baseUrl}/scenarios` },
    { url: `${baseUrl}/faq` },
    { url: `${baseUrl}/glossary` },
  ]

  const scenarioPages: MetadataRoute.Sitemap = scenarios.map((scenario) => ({
    url: `${baseUrl}/scenarios/${scenario.slug}`,
    lastModified: validDate(scenario.dateModified ?? scenario.datePublished),
  }))

  const blogPostPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: validDate(post.date),
  }))

  let bookPages: MetadataRoute.Sitemap = []
  let eventPages: MetadataRoute.Sitemap = []
  let mediaPages: MetadataRoute.Sitemap = []

  try {
    // Dynamic book pages — only published and publicly visible records.
    const books = await sql`
      select slug, updated_at
      from books
      where is_published = true and is_visible = true
    `
    bookPages = books.map((book) => ({
      url: `${baseUrl}/books/${book.slug}`,
      lastModified: validDate(book.updated_at as string | null),
    }))

    // The public event surfaces are explicitly framed as upcoming. Completed
    // events belong in a separately labelled archive and are not advertised here.
    // Was .eq("is_visible",true).or("starts_at.gte.<now>") — i.e. upcoming only.
    const events = await sql`
      select slug, updated_at
      from events
      where is_visible = true and starts_at >= now()
    `
    eventPages = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: validDate(event.updated_at as string | null),
    }))

    // Dynamic media pages — only publicly visible records.
    const media = await sql`
      select slug, updated_at
      from media_items
      where is_visible = true
    `
    mediaPages = media.map((item) => ({
      url: `${baseUrl}/media/${item.slug}`,
      lastModified: validDate(item.updated_at as string | null),
    }))
  } catch (error) {
    // A database outage must not make the sitemap endpoint fail completely.
    // Static and file-backed editorial routes still remain discoverable.
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
