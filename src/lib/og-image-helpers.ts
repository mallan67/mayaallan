/**
 * Shared helpers for OG / Twitter image routes (edge runtime).
 *
 * Three concerns this consolidates:
 *   1. Font fetch (Inter regular + bold from Google Fonts) is wrapped in
 *      try/catch with non-sensitive logging so a transient gstatic.com
 *      outage doesn't crash the route. The caller renders without those
 *      glyphs falling back to system fonts.
 *   2. ImageResponse cache headers — every social-share unfurl would
 *      otherwise rebuild the PNG, re-fetch fonts, and re-query Supabase.
 *      A 1-hour browser cache + 1-day CDN cache + 1-week SWR window
 *      collapses that cost without making stale book metadata visible
 *      for long.
 *   3. `ogFonts` filters out failed font loads so the fonts array passed
 *      to ImageResponse never contains undefined/null entries.
 */

const FONT_REGULAR_URL =
  "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2"
const FONT_BOLD_URL =
  "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2"

/**
 * Cache-Control header to apply to every OG / Twitter ImageResponse.
 *   public:                  CDN + browser caches are both allowed
 *   max-age=3600:            browser cache for 1 hour
 *   s-maxage=86400:          shared CDN cache for 1 day
 *   stale-while-revalidate=604800:  serve stale up to 1 week while
 *                                   re-fetching in the background
 */
export const OG_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
} as const

/**
 * Fetch an Inter font weight from Google Fonts. Returns null on failure
 * after a non-sensitive log (the URL itself is public, the only fact in
 * the log is "font fetch failed"). The caller should pass the result
 * to `ogFonts` which filters nulls before handing the array to
 * ImageResponse.
 */
export async function loadInterFont(
  weight: 400 | 700,
  source: string,
): Promise<ArrayBuffer | null> {
  const url = weight === 400 ? FONT_REGULAR_URL : FONT_BOLD_URL
  try {
    const res = await fetch(new URL(url))
    if (!res.ok) {
      console.error(`[${source}] font fetch HTTP ${res.status} (weight=${weight})`)
      return null
    }
    return await res.arrayBuffer()
  } catch (err) {
    console.error(
      `[${source}] font fetch threw (weight=${weight}):`,
      err instanceof Error ? err.message : String(err),
    )
    return null
  }
}

type OgFont = {
  name: string
  data: ArrayBuffer
  style: "normal"
  weight: 400 | 700
}

/**
 * Build the `fonts` array for ImageResponse. Skips entries whose font
 * fetch failed (null) so the array passed downstream is always valid.
 */
export function ogFonts(
  regular: ArrayBuffer | null,
  bold: ArrayBuffer | null,
): OgFont[] {
  const out: OgFont[] = []
  if (regular) out.push({ name: "Inter", data: regular, style: "normal", weight: 400 })
  if (bold) out.push({ name: "Inter", data: bold, style: "normal", weight: 700 })
  return out
}

/**
 * Log a non-sensitive data-fetch failure from an OG / Twitter route.
 * The caller is expected to return their generic fallback image — this
 * helper just makes the failure observable in Vercel logs.
 */
export function logOgDataFailure(source: string, err: unknown) {
  console.error(
    `[${source}] supabase data fetch failed:`,
    err instanceof Error ? err.message : String(err),
  )
}
