import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"

/**
 * DOWNLOAD ROUTE — atomic conditional increment
 *
 * This implementation:
 * 1. Loads the token + book + order to validate
 * 2. Executes a conditional UPDATE that increments
 *    downloadCount only when downloadCount < maxDownloads
 * 3. If the update affected 0 rows, the limit was reached
 * 4. Redirects the client to the ebook file URL
 *
 * File: src/app/api/download/[token]/route.ts
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const resolvedParams = await params
  const tokenParam = resolvedParams?.token
  if (!tokenParam) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    const now = new Date()

    // 1) Read token + relations for validation
    const { data: dt, error: fetchError } = await supabaseAdmin
      .from(Tables.downloadTokens)
      .select(`
        *,
        book:books (*),
        order:orders (*)
      `)
      .eq("token", tokenParam)
      .single()

    if (fetchError || !dt) {
      return NextResponse.json({ error: "Invalid download link" }, { status: 404 })
    }

    if (dt.expires_at && new Date(dt.expires_at) < now) {
      return NextResponse.json({ error: "Download link has expired" }, { status: 410 })
    }

    if (!dt.order || dt.order.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 })
    }

    if (!dt.book || !dt.book.ebook_file_url) {
      return NextResponse.json({ error: "Ebook file not available" }, { status: 404 })
    }

    // Check if download limit reached
    if (dt.download_count >= dt.max_downloads) {
      return NextResponse.json({ error: "Download limit reached" }, { status: 403 })
    }

    // 2) Increment download count
    const { error: updateError } = await supabaseAdmin
      .from(Tables.downloadTokens)
      .update({
        download_count: dt.download_count + 1,
        last_used_at: now.toISOString(),
      })
      .eq("id", dt.id)
      .lt("download_count", dt.max_downloads)

    if (updateError) {
      console.error("Error updating download count:", updateError)
      // Still allow download but log the error
    }

    // 3) Redirect to the ebook file URL
    return NextResponse.redirect(dt.book.ebook_file_url)
  } catch (err: any) {
    console.error("Download error:", err)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
