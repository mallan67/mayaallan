import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE, SITE_URL, type Locale } from "@/lib/identity"

// =============================================================================
// hreflang helpers
// =============================================================================
// Use this in any page's generateMetadata() to declare which translations
// exist. Tells Google to show the right language version to the right user
// (German searcher → /de/about, etc.) without thinking they're duplicate
// content.
//
//   import { hreflangAlternates } from "@/lib/i18n/hreflang"
//
//   export const metadata = {
//     alternates: hreflangAlternates("/about"),
//   }
// =============================================================================

/**
 * Build the `alternates.languages` map for a route path that exists in
 * multiple locales. English lives at the root path; other locales live at
 * /{locale}{path}.
 *
 * @param path - The route path (e.g., "/about", "/", "/books/foo")
 * @param translatedLocales - Optional whitelist of locales this path is
 *   actually translated in. Defaults to all locales. Pass a subset when only
 *   some translations exist so you don't tell Google about missing pages.
 */
export function hreflangAlternates(
  path: string,
  translatedLocales: readonly Locale[] = LOCALES
): { canonical?: string; languages: Record<string, string> } {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const languages: Record<string, string> = {}

  // x-default points to the default-locale version per Google's recommendation.
  // It's what gets shown when there's no language match for the user.
  languages["x-default"] = `${SITE_URL}${normalized}`

  for (const locale of translatedLocales) {
    const hreflang = LOCALE_LABELS[locale].hreflang
    const url =
      locale === DEFAULT_LOCALE
        ? `${SITE_URL}${normalized}`
        : `${SITE_URL}/${locale}${normalized === "/" ? "" : normalized}`
    languages[hreflang] = url
  }

  return { languages }
}

/**
 * Same as hreflangAlternates but for sitemap entries. Next.js
 * MetadataRoute.Sitemap supports an `alternates.languages` field that emits
 * <xhtml:link rel="alternate" hreflang="..."> tags in the sitemap XML.
 */
export function sitemapAlternates(
  path: string,
  translatedLocales: readonly Locale[] = LOCALES
): Record<string, string> {
  return hreflangAlternates(path, translatedLocales).languages
}
