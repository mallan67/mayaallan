import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { alertAdmin } from "@/lib/alert-admin"

/**
 * DOWNLOAD ROUTE — atomic + streamed + counter-safe ebook delivery
 *
 * Flow:
 *   1. Atomic conditional increment via Postgres RPC `increment_download_count`.
 *      The RPC takes a row lock (FOR UPDATE), checks expires_at, checks the
 *      cap, and increments — all in one statement.
 *   2. After 'ok', look up the order + book using the IDs the RPC returned.
 *   3. Stream the file through the function with Content-Disposition: attachment.
 *
 * Counter compensation (PR B):
 *   The RPC increments BEFORE we fetch the blob. If ANYTHING fails AFTER
 *   a successful increment (DB lookups, missing file URL, blob fetch error,
 *   unexpected throw), the customer is owed a refund of one download attempt.
 *   `decrement_download_count` is called on every such path. If the
 *   compensation itself fails, alertAdmin fires so Maya can restore manually.
 *
 *   User-caused statuses (not_found / expired / maxed / no_order) DID NOT
 *   increment in the first place, so they are NOT decremented.
 */

export const runtime = "nodejs"

/** Build a customer-friendly filename from the book title + URL extension. */
function buildDownloadFilename(bookTitle: string | null, fileUrl: string): string {
  const safeTitle = (bookTitle ?? "ebook")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ebook"

  const urlPath = fileUrl.split(/[?#]/)[0] ?? fileUrl
  const ext = urlPath.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() ?? "pdf"

  return `${safeTitle}.${ext}`
}

/**
 * Restore one download attempt after a post-increment failure. Returns
 * silently on success; alerts on failure (the customer's counter is then
 * burnt and Maya needs to manually decrement or extend).
 */
async function compensateDecrement(token: string, context: { reason: string; orderId?: number | null; bookId?: number | null }) {
  const { data, error } = await supabaseAdmin.rpc("decrement_download_count", {
    p_token: token,
  })

  // Compensation failed at the RPC layer — DB unreachable or function not deployed.
  if (error) {
    console.error("decrement_download_count failed:", error)
    await alertAdmin({
      severity: "critical",
      subject: "Download counter compensation FAILED — customer download attempt burned",
      body:
        "After increment_download_count succeeded, a downstream failure forced the " +
        "compensating decrement_download_count call. That compensation call ALSO " +
        "failed. The paying customer has lost one of their 5 download attempts and " +
        "no automated retry will restore it. Bump the download_count back manually:\n\n" +
        "  UPDATE public.download_tokens SET download_count = download_count - 1 " +
        "WHERE token = '<see details>' AND download_count > 0;",
      details: {
        ...context,
        compensationErrorCode: error.code,
        compensationErrorMessage: error.message,
      },
      dedupKey: "download:compensation-failed",
    })
    return
  }

  const result = Array.isArray(data) ? data[0] : data
  // 'at_zero' or 'no_token' means there was nothing to compensate (counter
  // already 0, or the row was deleted between increment and decrement).
  // 'ok' is the happy path. Anything else is unexpected.
  if (result && result.status !== "ok" && result.status !== "at_zero" && result.status !== "no_token") {
    await alertAdmin({
      severity: "warning",
      subject: "Download counter compensation returned unexpected status",
      body: `decrement_download_count returned an unexpected status: ${result.status}`,
      details: context,
      dedupKey: "download:compensation-unknown-status",
    })
  }
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

  // Once `incrementSucceeded` is true, every failure path MUST call
  // compensateDecrement before returning.
  let incrementSucceeded = false

  try {
    // ------------------------------------------------------------------
    // 1) Atomic conditional increment via RPC
    // ------------------------------------------------------------------
    const { data: rpcRows, error: rpcError } = await supabaseAdmin.rpc(
      "increment_download_count",
      { p_token: tokenParam }
    )

    if (rpcError) {
      console.error("increment_download_count RPC failed:", rpcError)
      await alertAdmin({
        severity: "error",
        subject: "Download route: counter RPC failed",
        body:
          "The increment_download_count RPC errored. Paid customers cannot " +
          "download their book until this is resolved. Confirm the function " +
          "is deployed and the service role has EXECUTE permission.",
        details: { errorCode: rpcError.code, errorMessage: rpcError.message },
        dedupKey: "download:rpc-failed",
      })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    const result = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows

    if (!result) {
      console.error("increment_download_count returned no rows")
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
        incrementSucceeded = true
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

    const orderId = result.order_id as number
    const bookId = result.book_id as number

    // ------------------------------------------------------------------
    // From here every failure must compensate.
    // ------------------------------------------------------------------
    const { data: order, error: orderError } = await supabaseAdmin
      .from(Tables.orders)
      .select("id, status")
      .eq("id", orderId)
      .single()

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
      await compensateDecrement(tokenParam, { reason: "order-lookup-failed", orderId, bookId })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    if (!order || order.status !== "completed") {
      // User-state issue, but the increment already ran. The customer has
      // a token and they shouldn't have been able to reach 'ok' status
      // from the RPC if the order didn't exist — this is anomalous. Refund
      // the attempt so they're not punished.
      await compensateDecrement(tokenParam, { reason: "order-not-completed", orderId, bookId })
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
      await compensateDecrement(tokenParam, { reason: "book-lookup-failed", orderId, bookId })
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      )
    }

    if (!book || !book.ebook_file_url) {
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
      await compensateDecrement(tokenParam, { reason: "no-ebook-file-url", orderId, bookId })
      return NextResponse.json(
        { error: "Ebook file not available. Please contact support." },
        { status: 500 }
      )
    }

    // ------------------------------------------------------------------
    // 2) Stream the file through the function with Content-Disposition.
    // ------------------------------------------------------------------
    let upstream: Response
    try {
      upstream = await fetch(book.ebook_file_url)
    } catch (fetchErr) {
      console.error("Blob fetch threw:", fetchErr)
      await alertAdmin({
        severity: "critical",
        subject: "Download route: upstream blob fetch THREW",
        body:
          "The fetch() to Vercel Blob threw before returning a Response. The customer's " +
          "download attempt has been compensated. Confirm the blob URL is still valid.",
        details: {
          bookId,
          errorMessage: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
        },
        dedupKey: `download:blob-fetch-threw:${bookId}`,
      })
      await compensateDecrement(tokenParam, { reason: "blob-fetch-threw", orderId, bookId })
      return NextResponse.json(
        { error: "Download temporarily unavailable. Please try again in a moment." },
        { status: 502 }
      )
    }

    if (!upstream.ok) {
      console.error("Blob fetch non-OK:", upstream.status, upstream.statusText)
      await alertAdmin({
        severity: "critical",
        subject: "Download route: upstream blob fetch failed",
        body:
          "Fetching the ebook file from Vercel Blob returned a non-OK status. " +
          "The customer's download attempt has been compensated.",
        details: { bookId, status: upstream.status, statusText: upstream.statusText },
        dedupKey: `download:blob-fetch-failed:${bookId}`,
      })
      await compensateDecrement(tokenParam, { reason: "blob-fetch-non-ok", orderId, bookId })
      return NextResponse.json(
        { error: "Download temporarily unavailable. Please try again in a moment." },
        { status: 502 }
      )
    }

    if (!upstream.body) {
      await alertAdmin({
        severity: "critical",
        subject: "Download route: blob fetch returned no body",
        body: "The upstream fetch was OK but the response had no body. Investigate.",
        details: { bookId, status: upstream.status },
        dedupKey: `download:blob-no-body:${bookId}`,
      })
      await compensateDecrement(tokenParam, { reason: "blob-no-body", orderId, bookId })
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
      // RFC-5987 form for non-ASCII filenames + a quoted ASCII fallback.
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
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
      body: "The download handler threw. If increment had succeeded, the counter has been compensated.",
      details: { errorMessage: err?.message ?? String(err), incrementSucceeded },
      dedupKey: "download:handler-threw",
    })
    if (incrementSucceeded) {
      await compensateDecrement(tokenParam, { reason: "handler-threw-after-increment" })
    }
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again in a moment." },
      { status: 503 }
    )
  }
}
