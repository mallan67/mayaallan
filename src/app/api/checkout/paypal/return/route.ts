/**
 * GET /api/checkout/paypal/return — PayPal post-approval landing.
 *
 * The customer is sent here by PayPal after they approve the order
 * (?token=<orderId>&PayerID=<...>). The order is APPROVED but NOT yet
 * captured — this route calls /v2/checkout/orders/<id>/capture to actually
 * move the money, then sends the customer to /books/<slug>?payment=success.
 *
 * Security gates (in order):
 *   1. Per-IP rate-limit blocks scripted capture spam.
 *   2. The ?token is looked up in pending_paypal_orders. Unknown / consumed /
 *      expired tokens are refused without ever calling PayPal. Defeats the
 *      replay attack where an attacker tries to force-capture another
 *      customer's APPROVED order.
 *   3. Soft binding: ip_hash + user_agent_hash mismatches do NOT block (real
 *      users can switch networks/devices mid-flow) but DO fire a warning
 *      alert so we can spot anomalies.
 *   4. AbortSignal.timeout(20_000) on the capture fetch — without this a
 *      hanging PayPal API call lets Vercel kill the function (504) before
 *      our catch runs, leaving the customer with a generic Vercel error and
 *      no alert.
 *   5. Coarse dedup keys on capture-abuse paths (one alert per IP per hour,
 *      not one per attempted orderId) so a brute-force probe can't flood
 *      the admin inbox.
 *
 * Idempotency:
 *   PayPal returns 422 ORDER_ALREADY_CAPTURED if we re-attempt the same
 *   order. We treat that as success — the webhook itself dedupes by
 *   paypal_order_id (PR A).
 */
import { NextResponse, type NextRequest } from "next/server"
import { alertAdmin } from "@/lib/alert-admin"
import { apiBase, getAccessToken, safePaypalEnvLabel } from "@/lib/paypal"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { siteUrl } from "@/lib/site-url"
import { createHash } from "node:crypto"

export const runtime = "nodejs"
// 60s budget: the capture POST itself has a 20s AbortSignal cap, plus DB
// lookups + updates + redirect work. Default Vercel timeout (10-15s) can kill
// the function mid-capture, leaving customer money APPROVED-but-not-captured
// without firing the catch-block alert.
export const maxDuration = 60

/** Window (ms) within which a pending_paypal_orders row is considered fresh. */
const PENDING_ORDER_TTL_MS = 60 * 60 * 1000 // 1 hour

function safeSlug(s: string | null): string | null {
  if (!s) return null
  // Allowlist-style validation — only lowercase alnum + hyphens. Stops any
  // open-redirect / path-injection cuteness via the bookSlug query param.
  return /^[a-z0-9][a-z0-9-]{0,80}$/.test(s) ? s : null
}

function hashForBinding(value: string | null | undefined): string | null {
  if (!value) return null
  return createHash("sha256").update(value).digest("hex").slice(0, 64)
}

function redirectToBook(
  bookSlug: string | null,
  status: "success" | "cancelled" | "error",
  orderIdForSuccess?: string,
): NextResponse {
  const validSlug = safeSlug(bookSlug)

  // SUCCESS goes to a dedicated /checkout/success page — NOT back to the
  // book page. The success page is intentionally minimal: it renders a
  // generic "purchase complete" message, never displays buyer name / email
  // / order details, and clears any client-side checkout state on mount.
  // This is the shared-computer privacy mitigation: the next person to use
  // this browser must NOT see who just bought.
  //
  // CANCELLED and ERROR still go back to the book page so the buyer can
  // see context and retry.
  let url: string
  if (status === "success") {
    const orderParam = orderIdForSuccess ? `&orderId=${encodeURIComponent(orderIdForSuccess)}` : ""
    const slugParam = validSlug ? `&bookSlug=${encodeURIComponent(validSlug)}` : ""
    url = `${siteUrl()}/checkout/success?via=paypal${orderParam}${slugParam}`
  } else {
    const path = validSlug ? `/books/${validSlug}` : "/"
    url = `${siteUrl()}${path}?payment=${status}`
  }

  const res = NextResponse.redirect(url, { status: 303 })
  // Don't let any intermediary cache the 303 — the token in the URL is single-use,
  // and the destination must always re-render fresh (no stale buyer info shown).
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
  res.headers.set("Pragma", "no-cache")
  res.headers.set("Expires", "0")
  return res
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate-limit BEFORE we look anything up — defends against scripted capture
  // probes that try to brute-force valid order IDs.
  const limit = await rateLimit({
    scope: "paypal-return",
    ip,
    windowMs: 15 * 60 * 1000,
    maxAttempts: 20,
    lockoutMs: 30 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  const { searchParams } = request.nextUrl
  const orderId = searchParams.get("token") // PayPal calls the order ID "token" in the return URL
  const bookSlugParam = searchParams.get("bookSlug")
  const bookSlug = safeSlug(bookSlugParam) // null if invalid

  if (!orderId) {
    // PayPal didn't pass back an order ID — most likely the customer hit the
    // cancel button or refreshed the URL after the params dropped. Treat as
    // cancellation (not an error worth alerting on).
    return redirectToBook(bookSlug, "cancelled")
  }

  // ----------------------------------------------------------------------
  // GATE: the orderId must be a row we created in pending_paypal_orders and
  // it must still be 'pending'. This is the primary defense against
  // third-party capture replay.
  // ----------------------------------------------------------------------
  const { data: pending, error: pendingFetchError } = await supabaseAdmin
    .from("pending_paypal_orders")
    .select("id, paypal_order_id, book_id, book_slug, status, created_at, ip_hash, user_agent_hash")
    .eq("paypal_order_id", orderId)
    .maybeSingle()

  if (pendingFetchError) {
    console.error("pending_paypal_orders lookup failed:", pendingFetchError)
    await alertAdmin({
      severity: "error",
      subject: "PayPal return: pending order lookup failed",
      body:
        "Looking up pending_paypal_orders for an incoming return failed with a non-PGRST116 error. " +
        "Capture cannot proceed safely until this is resolved.",
      details: { paypalOrderId: orderId, errorCode: pendingFetchError.code },
      dedupKey: "paypal:return-pending-lookup-failed",
    })
    return redirectToBook(bookSlug, "error")
  }

  if (!pending) {
    // Unknown orderId — either an attacker is probing, or our pending insert
    // failed earlier and the customer is genuinely stuck. Either way, refuse
    // to capture. Use a COARSE dedup key so probe spam doesn't flood the inbox.
    console.warn("Unknown PayPal orderId on return", { orderId })
    await alertAdmin({
      severity: "warning",
      subject: "PayPal return: unknown order id (possible replay attempt)",
      body:
        "An incoming /api/checkout/paypal/return ?token did not match any row in " +
        "pending_paypal_orders. This is most likely a third party attempting to " +
        "capture an order they didn't create, but could also indicate a stuck legitimate " +
        "customer whose pending-order INSERT failed earlier. Check Vercel logs.",
      details: { paypalOrderId: orderId },
      // COARSE dedup: one alert per hour regardless of how many bogus IDs are tried.
      dedupKey: "paypal:return-unknown-order",
    })
    return redirectToBook(bookSlug, "error")
  }

  // Already consumed — likely a customer reloading the success page after
  // PayPal already captured. Treat as benign success (the webhook is what
  // creates the order row + token + email; that path is idempotent on its
  // own end via paypal_order_id from PR A).
  if (pending.status === "consumed") {
    return redirectToBook(pending.book_slug, "success", orderId)
  }

  if (pending.status === "expired") {
    // The pending row was reaped before the customer returned.
    await alertAdmin({
      severity: "info",
      subject: "PayPal return: capture attempted on expired pending order",
      body:
        "A customer returned from PayPal with an order id that we had marked expired. " +
        "Either the user took >1h to approve, or they returned to an old approval URL. " +
        "Refusing to capture.",
      details: { paypalOrderId: orderId, createdAt: pending.created_at },
      dedupKey: "paypal:return-expired-order",
    })
    return redirectToBook(pending.book_slug, "error")
  }

  // Soft TTL check — anything older than PENDING_ORDER_TTL_MS gets refused.
  const createdAtMs = pending.created_at ? new Date(pending.created_at).getTime() : 0
  if (Number.isFinite(createdAtMs) && Date.now() - createdAtMs > PENDING_ORDER_TTL_MS) {
    // Mark it expired so subsequent probes hit the 'expired' branch above
    // (which is dedup'd separately from unknown-order alerts).
    await supabaseAdmin
      .from("pending_paypal_orders")
      .update({ status: "expired" })
      .eq("id", pending.id)

    return redirectToBook(pending.book_slug, "error")
  }

  // Soft binding warning: IP / UA mismatch is suspicious but not blocking
  // (mobile users switch networks; some users have multiple tabs/devices).
  const currentIpHash = hashForBinding(ip)
  const currentUaHash = hashForBinding(request.headers.get("user-agent"))
  if (
    (pending.ip_hash && currentIpHash && pending.ip_hash !== currentIpHash) ||
    (pending.user_agent_hash && currentUaHash && pending.user_agent_hash !== currentUaHash)
  ) {
    await alertAdmin({
      severity: "warning",
      subject: "PayPal return: IP/UA mismatch on capture (soft warning)",
      body:
        "The IP or user-agent on the capture-return request does not match the values " +
        "captured at create-order time. This is often legitimate (mobile networks, multi-device " +
        "flows, VPN toggles) but is worth noting. Proceeding with capture; review if pattern recurs.",
      details: {
        paypalOrderId: orderId,
        ipMatch: pending.ip_hash === currentIpHash,
        uaMatch: pending.user_agent_hash === currentUaHash,
      },
      // COARSE dedup — one alert per hour total, not one per orderId.
      dedupKey: "paypal:return-binding-mismatch",
    })
    // No early return — we proceed with capture.
  }

  // ----------------------------------------------------------------------
  // OAuth token
  // ----------------------------------------------------------------------
  let accessToken: string
  try {
    accessToken = await getAccessToken()
  } catch (err) {
    await alertAdmin({
      severity: "critical",
      subject: "PayPal return: could not get access token to capture order",
      body:
        "A customer approved a PayPal payment but we could not get an OAuth token to capture it. " +
        "The payment is sitting APPROVED on PayPal's side, NOT captured. The customer is " +
        "looking at our site right now wondering what happened. Verify PAYPAL_CLIENT_ID and " +
        "PAYPAL_CLIENT_SECRET / PAYPAL_SECRET in Vercel env vars, then capture manually from " +
        "the PayPal dashboard.",
      details: { paypalOrderId: orderId, bookSlug: pending.book_slug, paypalEnv: safePaypalEnvLabel(), errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "paypal:return-token-failed",
    })
    return redirectToBook(pending.book_slug, "error")
  }

  // ----------------------------------------------------------------------
  // Capture (with timeout — Vercel's function timeout will otherwise eat the
  // catch and we lose the alert)
  // ----------------------------------------------------------------------
  let captureResponse: Response
  try {
    captureResponse = await fetch(
      `${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // 20s — well below the Vercel function timeout but generous for PayPal.
        signal: AbortSignal.timeout(20_000),
      },
    )
  } catch (err) {
    const isTimeout =
      err instanceof DOMException && err.name === "TimeoutError"
        ? true
        : err instanceof Error && /aborted|timeout/i.test(err.message)
    if (isTimeout) {
      await alertAdmin({
        severity: "critical",
        subject: "PayPal return: capture request TIMED OUT",
        body:
          "The capture POST to PayPal exceeded 20 seconds. The customer's payment may or may " +
          "not have been captured. Verify in the PayPal dashboard and reconcile manually if needed.",
        details: { paypalOrderId: orderId, bookSlug: pending.book_slug, paypalEnv: safePaypalEnvLabel() },
        dedupKey: `paypal:return-capture-timeout:${orderId}`,
      })
    } else {
      await alertAdmin({
        severity: "critical",
        subject: "PayPal return: capture request THREW",
        body:
          "The capture POST to PayPal threw before returning. The customer's payment may or may " +
          "not have been captured. Verify in the PayPal dashboard and reconcile manually if needed.",
        details: {
          paypalOrderId: orderId,
          bookSlug: pending.book_slug,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
        dedupKey: `paypal:return-capture-threw:${orderId}`,
      })
    }
    return redirectToBook(pending.book_slug, "error")
  }

  // Idempotency: if the customer reloads this route after a successful
  // capture PayPal returns 422 with name=UNPROCESSABLE_ENTITY and
  // issue=ORDER_ALREADY_CAPTURED. That's our "everything is fine" signal.
  if (captureResponse.status === 422) {
    const body = await captureResponse.json().catch(() => null)
    const detailsArray = body && Array.isArray((body as any).details) ? (body as any).details : []
    const alreadyCaptured = detailsArray.some(
      (d: any) => d?.issue === "ORDER_ALREADY_CAPTURED",
    )
    if (alreadyCaptured) {
      // Mark consumed (idempotent). Alert if the update itself fails so
      // we don't silently leave the row in 'pending' — a stale row could
      // make a future legitimate retry look like a probe.
      const { error: consumedUpdateError } = await supabaseAdmin
        .from("pending_paypal_orders")
        .update({ status: "consumed", consumed_at: new Date().toISOString() })
        .eq("id", pending.id)
      if (consumedUpdateError) {
        await alertAdmin({
          severity: "warning",
          subject: "PayPal return: consumed-state update failed (already-captured path)",
          body:
            "PayPal reported ORDER_ALREADY_CAPTURED so capture is fine, but updating " +
            "pending_paypal_orders.status to 'consumed' failed. A reload of this URL " +
            "may produce inconsistent alert state. Customer still gets payment=success.",
          details: { paypalOrderId: orderId, errorCode: consumedUpdateError.code },
          dedupKey: "paypal:consumed-update-failed-422",
        })
      }
      return redirectToBook(pending.book_slug, "success", orderId)
    }
    await alertAdmin({
      severity: "error",
      subject: "PayPal return: capture rejected with 422 (not already-captured)",
      body: "PayPal rejected the capture request with a 422 that wasn't ORDER_ALREADY_CAPTURED.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        paypalIssue: (body as any)?.name,
        details: detailsArray,
        bodyParseFailed: body === null,
      },
      dedupKey: `paypal:return-capture-422:${orderId}`,
    })
    return redirectToBook(pending.book_slug, "error")
  }

  if (!captureResponse.ok) {
    const body = await captureResponse.json().catch(() => ({} as any))
    await alertAdmin({
      severity: "critical",
      subject: "PayPal return: capture FAILED — customer didn't get charged",
      body:
        "A customer approved a payment on PayPal but the subsequent capture call failed. " +
        "The customer's card was NOT charged. Investigate the PayPal response in the details below.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        status: captureResponse.status,
        paypalErrorName: body?.name,
        paypalDetails: body?.details,
        paypalEnv: safePaypalEnvLabel(),
      },
      dedupKey: `paypal:return-capture-failed:${orderId}`,
    })
    return redirectToBook(pending.book_slug, "error")
  }

  // H2: A 2xx capture response does NOT by itself mean the money settled.
  // PayPal can return 2xx with the capture in a non-COMPLETED state (PENDING
  // for eCheck / risk-hold, etc). Parse the real capture status before we
  // send the customer to the success page. Canonical path is
  // purchase_units[0].payments.captures[0].status; fall back to body.status.
  const captureBody = await captureResponse.json().catch(() => ({} as any))
  const captureStatus: string | undefined =
    captureBody?.purchase_units?.[0]?.payments?.captures?.[0]?.status ??
    captureBody?.status

  // SUCCESS — PayPal captured. Mark the pending row consumed so reload of
  // this URL doesn't re-attempt. This happens REGARDLESS of capture status
  // (the capture call was made — the order must not be replayable). The
  // webhook handler does the real fulfillment work (creating the orders row,
  // download_token row, email) and dedupes idempotently on its own end via
  // paypal_order_id (PR A) — and only on the webhook's COMPLETED event.
  const { error: consumedUpdateError } = await supabaseAdmin
    .from("pending_paypal_orders")
    .update({ status: "consumed", consumed_at: new Date().toISOString() })
    .eq("id", pending.id)
  if (consumedUpdateError) {
    // Customer still got their capture; don't fail their session over it.
    // Alert so we don't silently leave lifecycle state inconsistent.
    await alertAdmin({
      severity: "warning",
      subject: "PayPal return: consumed-state update failed after successful capture",
      body:
        "Capture succeeded but updating pending_paypal_orders.status to 'consumed' " +
        "failed. The customer was redirected to ?payment=success. A reload of the " +
        "return URL may produce noisy alerts (the row will look 'pending' until the " +
        "expired TTL kicks in).",
      details: { paypalOrderId: orderId, errorCode: consumedUpdateError.code },
      dedupKey: "paypal:consumed-update-failed-success",
    })
  }

  // H2: capture is 2xx but NOT COMPLETED (e.g. PENDING eCheck/risk hold). Do
  // NOT send the customer to the success page — fulfillment correctly waits
  // for the webhook's COMPLETED event. Redirect to the existing success page
  // in its pending mode (?status=pending) instead.
  if (captureStatus !== "COMPLETED") {
    await alertAdmin({
      severity: "critical",
      subject: "PayPal return: capture not COMPLETED (held/pending)",
      body:
        "A redirect-flow capture returned 2xx but the capture status is not COMPLETED. " +
        "The funds are likely PENDING (eCheck / risk hold). The customer was sent to the " +
        "pending outcome, NOT success; fulfillment will happen if/when the webhook delivers " +
        "a COMPLETED event for this order.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        captureStatus: captureStatus ?? null,
        paypalEnv: safePaypalEnvLabel(),
      },
      dedupKey: `paypal:return-capture-not-completed:${orderId}`,
    })
    const pendingUrl = `${siteUrl()}/checkout/success?status=pending`
    const res = NextResponse.redirect(pendingUrl, { status: 303 })
    // Same no-store headers redirectToBook applies — the token in the URL is
    // single-use and the destination must always re-render fresh.
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
    res.headers.set("Pragma", "no-cache")
    res.headers.set("Expires", "0")
    return res
  }

  return redirectToBook(pending.book_slug, "success", orderId)
}
