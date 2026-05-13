import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { alertAdmin } from "@/lib/alert-admin"

/**
 * DOWNLOAD ROUTE — atomic + streamed ebook delivery
 *
 * Flow:
 *   1. Atomic conditional increment via Postgres RPC `increment_download_count`.
 *      The RPC takes a row lock (FOR UPDATE), checks expires_at, checks the
 *      download_count vs max_downloads cap, then increments — all in one
 *      statement. This replaces the previous read-then-update pattern which
 *      had a TOCTOU race that let concurrent requests bypass the cap.
 *   2. The RPC returns a `status` discriminator and the linked order_id /
 *      book_id. We branch on status for the 401/403/404/410 responses.
 *   3. If status='ok', we fetch the order + book rows (we have the IDs from
 *      the RPC) to validate completion + locate the ebook file.
 *   4. The file is STREAMED through the function with Content-Disposition:
 *      attachment and Cache-Control: private, no-store. The customer never
 *      sees the underlying Vercel Blob URL, so it can't leak via browser
 *      history, referrer logs, or shared link.
 *
 * Anything that looks like an infra failure (DB error other than "no rows",
 * RPC unexpected error, blob fetch failure) is alerted via alertAdmin with a
 * dedup key, and the customer gets a 503 "try again" rather than a misleading
 * 404 that makes them think their valid token is invalid.
 *
 * Maximum streamed size is governed by Vercel's response body limit for the
 * runtime; with the streaming pattern (passing res.body directly) the limit
 * is far higher than the 4.5 MB request-body limit.
 */

export const runtime = "nodejs"

/** Build a customer-friendly filename from the book title + URL extension. */
function buildDownloadFilename(bookTitle: string | null, fileUrl: string): string {
  const safeTitle = (bookTitle ?? "ebook")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ebook"

  // Strip query/hash, then take the last path segment's extension.
  const urlPath = fileUrl.split(/[?#]/)[0] ?? fileUrl
  const ext = urlPath.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() ?? "pdf"

  return `${safeTitle}.${ext}`
}

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
    // ------------------------------------------------------------------
    // 1) Atomic conditional increment via RPC
    // ------------------------------------------------------------------
    const { data: rpcRows, error: rpcError } = await supabaseAdmin.rpc(
      "increment_download_count",
      { p_token: tokenParam }
    )

    if (rpcError) {
      // Real infrastructure error — DB unreachable, function not deployed,
      // permission revoked. DON'T tell the customer their token is invalid.
      console.error("increment_download_count RPC failed:", rpcError)
      await alertAdmin({
        severity: "error",
        subject: "Download route: counter RPC failed",
        body:
          "The increment_download_count RPC errored. Paid customers cannot " +
          "download their book until this is resolved. Confirm the function " +
          "is deployed (supabase/pr-a-critical-fixes.sql) and the service role " +
          "has EXECUTE permission.",
        details: { errorCode: rpcError.code, errorMessage: rpcError.message },
        dedupKey: "download:rpc-failed",
      })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    // The RPC returns SETOF with one row.
    const result = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows

    if (!result) {
      // Defensive — RPC returned no rows. Shouldn't happen.
      console.error("increment_download_count returned no rows for token")
      await alertAdmin({
        severity: "error",
        subject: "Download route: counter RPC returned no rows",
        body: "increment_download_count returned an empty result set. Investigate the RPC.",
        dedupKey: "download:rpc-empty",
      })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    switch (result.status) {
      case "not_found":
        return NextResponse.json({ error: "Invalid download link" }, { status: 404 })
      case "expired":
        return NextResponse.json({ error: "Download link has expired" }, { status: 410 })
      case "maxed":
        return NextResponse.json({ error: "Download limit reached" }, { status: 403 })
      case "no_order":
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 })
      case "ok":
        break
      default:
        await alertAdmin({
          severity: "error",
          subject: "Download route: unexpected RPC status",
          body: `increment_download_count returned an unexpected status: ${result.status}`,
          dedupKey: "download:rpc-unknown-status",
        })
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please try again in a moment." },
          { status: 503 }
        )
    }

    // ------------------------------------------------------------------
    // 2) Look up order + book using the IDs the RPC returned
    // ------------------------------------------------------------------
    const orderId = result.order_id as number
    const bookId = result.book_id as number

    const { data: order, error: orderError } = await supabaseAdmin
      .from(Tables.orders)
      .select("id, status")
      .eq("id", orderId)
      .single()

    // Real DB error vs "no rows": only PGRST116 is the legit 404 case.
    if (orderError && orderError.code !== "PGRST116") {
      console.error("Order lookup failed:", orderError)
      await alertAdmin({
        severity: "error",
        subject: "Download route: order lookup failed",
        body:
          "Looking up the order row for a paid customer failed with a non-PGRST116 error. " +
          "Customer cannot download their book until this is resolved.",
        details: { orderId, errorCode: orderError.code, errorMessage: orderError.message },
        dedupKey: "download:order-lookup-failed",
      })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    if (!order || order.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 })
    }

    const { data: book, error: bookError } = await supabaseAdmin
      .from(Tables.books)
      .select("id, title, ebook_file_url")
      .eq("id", bookId)
      .single()

    if (bookError && bookError.code !== "PGRST116") {
      console.error("Book lookup failed:", bookError)
      await alertAdmin({
        severity: "error",
        subject: "Download route: book lookup failed",
        body: "Looking up the book row for a paid download failed.",
        details: { bookId, errorCode: bookError.code, errorMessage: bookError.message },
        dedupKey: "download:book-lookup-failed",
      })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    if (!book || !book.ebook_file_url) {
      // Order is paid but the admin hasn't uploaded the file. Alert so it
      // gets fixed; tell the customer to contact us.
      await alertAdmin({
        severity: "critical",
        subject: "Download route: paid order has no ebook_file_url",
        body:
          "A customer with a valid paid token cannot download because the book " +
          "row has no ebook_file_url set. Check the admin book page and confirm " +
          "the ebook file was uploaded.",
        details: { orderId, bookId },
        dedupKey: `download:no-file-url:${bookId}`,
      })
      return NextResponse.json(
        { error: "Ebook file not available. Please contact support." },
        { status: 500 }
      )
    }

    // ------------------------------------------------------------------
    // 3) Stream the file through the function with Content-Disposition.
    //    Customer never sees the underlying Blob URL.
    // ------------------------------------------------------------------
    const upstream = await fetch(book.ebook_file_url)

    if (!upstream.ok || !upstream.body) {
      console.error("Blob fetch failed:", upstream.status, upstream.statusText)
      await alertAdmin({
        severity: "critical",
        subject: "Download route: upstream blob fetch failed",
        body:
          "Fetching the ebook file from Vercel Blob failed. Paid customer cannot " +
          "complete their download. Confirm the blob URL is still valid and the " +
          "file hasn't been deleted from storage.",
        details: { bookId, status: upstream.status, statusText: upstream.statusText },
        dedupKey: `download:blob-fetch-failed:${bookId}`,
      })
      return NextResponse.json(
        { error: "Download temporarily unavailable. Please try again in a moment." },
        { status: 502 }
      )
    }

    const filename = buildDownloadFilename(book.title, book.ebook_file_url)
    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
    const contentLength = upstream.headers.get("content-length")

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Don't let intermediaries or the browser cache this — every download
      // should go back through the function so the counter is enforced.
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    }
    if (contentLength) headers["Content-Length"] = contentLength

    return new NextResponse(upstream.body, { status: 200, headers })
  } catch (err: any) {
    console.error("Download error:", err)
    await alertAdmin({
      severity: "error",
      subject: "Download route: handler threw unexpectedly",
      body: "The download handler threw. Paid customer cannot get their file.",
      details: { errorMessage: err?.message ?? String(err) },
      dedupKey: "download:handler-threw",
    })
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again in a moment." },
      { status: 503 }
    )
  }
}
