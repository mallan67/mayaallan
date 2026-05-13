/**
 * POST /api/upload/blob-token
 *
 * Issues a signed token so the browser can upload an ebook file directly to
 * Vercel Blob, bypassing the Vercel function 4.5 MB body limit.
 *
 * Pattern: @vercel/blob/client `handleUpload()`. The browser sends a tiny
 * JSON request here, gets back a token, then PUTs the file straight to the
 * Blob CDN. The PDF never traverses our function — only metadata does.
 *
 * Security:
 *   - Admin session required (via isAuthenticated()) before a token is issued
 *   - Content types restricted to PDF and EPUB
 *   - Hard size cap (100 MB) — generous for an ebook, prevents accidental
 *     huge uploads
 *   - Token is short-lived and scoped to a single pathname by Vercel Blob
 *
 * NOTE: The resulting blob URL is `access: "public"` but uses
 * `addRandomSuffix: true` so the URL is unguessable. Real purchase gating
 * happens in /api/download/[token] which validates an order before
 * 302-redirecting to this URL.
 */
import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { isAuthenticated } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isAuthenticated())) {
          throw new Error("Unauthorized")
        }
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/epub+zip",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Hook for post-upload bookkeeping (not used yet).
        console.log("[upload/blob-token] ebook uploaded:", blob.pathname, blob.url)
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (error) {
    // Log full reason server-side; return generic to the client.
    console.error("[upload/blob-token] error:", error)
    const message = (error as Error)?.message || "Upload token issuance failed"
    // Surface the upstream message so the admin can see "Unauthorized" /
    // "size exceeds" — these are admin-only and not sensitive.
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
