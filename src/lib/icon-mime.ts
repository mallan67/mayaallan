/**
 * Derive a trustworthy MIME type for the admin-uploaded site icon from its URL
 * extension, or return undefined so <link rel="icon"> declares no type at all.
 * The icon lives in Vercel Blob and may be JPEG, PNG, SVG, ICO or WebP — a
 * hard-coded "image/png" was wrong for the JPEG currently in use.
 * Dependency-free.
 */
const BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  webp: "image/webp",
  gif: "image/gif",
}

export function iconMimeTypeFromUrl(url: string): string | undefined {
  if (!url) return undefined
  let pathname: string
  try {
    pathname = new URL(url).pathname
  } catch {
    return undefined
  }
  const lastSegment = pathname.split("/").pop() ?? ""
  const dot = lastSegment.lastIndexOf(".")
  if (dot < 0) return undefined
  const ext = lastSegment.slice(dot + 1).toLowerCase()
  return BY_EXTENSION[ext]
}
