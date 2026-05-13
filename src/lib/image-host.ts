/**
 * Tiny hostname allowlist for next/image.
 *
 * next.config.mjs `images.remotePatterns` currently allows only Vercel
 * Blob (`**.public.blob.vercel-storage.com`). Any image whose URL has a
 * different hostname would crash next/image at render time with
 * "hostname X is not configured under images in your next.config.js".
 *
 * Public list/detail pages (/events, /media) display image URLs that
 * land in the DB via admin upload widgets — those widgets route through
 * /api/upload which writes to Vercel Blob, so new uploads are safe.
 * BUT legacy rows or manually-edited rows could carry external URLs,
 * and we'd rather degrade gracefully than 500 the page.
 *
 * `isOptimizableImageHost` is the gate the pages use:
 *   - true  -> render with next/image (full optimization, AVIF/WebP, srcset)
 *   - false -> caller falls back to a raw <img> tag (eslint suppressed)
 */
export function isOptimizableImageHost(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const u = new URL(url)
    // Match the same wildcard remotePatterns entry in next.config.mjs.
    return u.hostname.endsWith(".public.blob.vercel-storage.com")
  } catch {
    return false
  }
}
