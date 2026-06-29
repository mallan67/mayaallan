/**
 * POST /api/checkout/paypal/capture-order — SDK v6 popup-flow capture.
 *
 * The PayPal JavaScript SDK v6 popup flow opens PayPal in a popup,
 * fires onApprove({orderId}) on the merchant page when the buyer
 * authorizes, then expects the merchant to call /v2/checkout/orders/
 * <id>/capture from their server. This endpoint is that server call.
 *
 * Companion to /api/checkout/paypal/return — the legacy redirect-flow
 * route — but invoked via JSON POST from client-side JS instead of via
 * 303 redirect from PayPal.
 *
 * Security parity with the redirect-flow capture:
 *   - Same pending_paypal_orders gate (refuses unknown orderIds)
 *   - Same TTL / consumed / expired checks
 *   - Same 20s AbortSignal.timeout on the capture fetch
 *   - Same idempotency on ORDER_ALREADY_CAPTURED
 *   - Same rate-limit envelope
 *
 * The webhook (/api/payment/paypal/webhook) is what creates the orders
 * row + download token + delivery email. This endpoint just moves money
 * and reports success/failure to the SDK client.
 */
import { NextResponse } from "next/server"
import { alertAdmin } from "@/lib/alert-admin"
import { apiBase, getAccessToken, safePaypalEnvLabel } from "@/lib/paypal"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { z } from "zod"

export const runtime = "nodejs"
export const maxDuration = 60

const PENDING_ORDER_TTL_MS = 60 * 60 * 1000 // 1 hour — matches the return route

const captureSchema = z.object({
  orderId: z.string().min(10).max(200),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)

  // Coarse rate-limit — prevents brute-force capture-id probing.
  const limit = await rateLimit({
    scope: "paypal-capture-order",
    ip,
    windowMs: 15 * 60 * 1000,
    maxAttempts: 20,
    lockoutMs: 30 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many capture attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

  let orderId: string
  try {
    const body = await request.json()
    orderId = captureSchema.parse(body).orderId
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // ----------------------------------------------------------------------
  // GATE: orderId must match a row we created in pending_paypal_orders.
  // Same defense as /api/checkout/paypal/return — refuses third-party
  // capture replays.
  // ----------------------------------------------------------------------
  const { data: pending, error: pendingFetchError } = await supabaseAdmin
    .from("pending_paypal_orders")
    .select("id, paypal_order_id, book_slug, status, created_at")
    .eq("paypal_order_id", orderId)
    .maybeSingle()

  if (pendingFetchError) {
    console.error("pending_paypal_orders lookup failed:", pendingFetchError)
    await alertAdmin({
      severity: "error",
      subject: "PayPal capture-order: pending order lookup failed",
      body:
        "DB lookup against pending_paypal_orders failed during a popup-flow capture. " +
        "Capture cannot proceed safely until this is resolved.",
      details: { paypalOrderId: orderId, errorCode: pendingFetchError.code },
      dedupKey: "paypal:capture-order-pending-lookup-failed",
    })
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 })
  }

  if (!pending) {
    // Unknown orderId — either an attacker is probing, or our pending insert
    // failed earlier. Coarse dedup so probe spam doesn't flood the inbox.
    console.warn("Unknown PayPal orderId on capture-order", { orderId })
    await alertAdmin({
      severity: "warning",
      subject: "PayPal capture-order: unknown order id (possible replay attempt)",
      body:
        "An incoming /api/checkout/paypal/capture-order POST did not match any row in " +
        "pending_paypal_orders. Likely a third-party attempting to capture an order " +
        "they didn't create, or a stuck buyer whose pending-order INSERT failed earlier.",
      details: { paypalOrderId: orderId },
      dedupKey: "paypal:capture-order-unknown",
    })
    return NextResponse.json({ error: "Unknown order" }, { status: 404 })
  }

  // Already consumed — buyer reload after a successful (COMPLETED) capture. Benign.
  if (pending.status === "consumed") {
    return NextResponse.json({ success: true, alreadyConsumed: true, bookSlug: pending.book_slug })
  }

  // Held — a prior capture came back PENDING (eCheck / risk hold). A reload must
  // NOT report success; fulfillment waits for the webhook's COMPLETED event.
  if (pending.status === "held") {
    return NextResponse.json(
      { pending: true, message: "Your payment is processing and you'll get an email once it clears." },
      { status: 202 },
    )
  }

  if (pending.status === "expired") {
    return NextResponse.json({ error: "This checkout has expired. Please start over." }, { status: 410 })
  }

  // Soft TTL check.
  const createdAtMs = pending.created_at ? new Date(pending.created_at).getTime() : 0
  if (Number.isFinite(createdAtMs) && Date.now() - createdAtMs > PENDING_ORDER_TTL_MS) {
    await supabaseAdmin
      .from("pending_paypal_orders")
      .update({ status: "expired" })
      .eq("id", pending.id)
    return NextResponse.json({ error: "This checkout has expired. Please start over." }, { status: 410 })
  }

  // ----------------------------------------------------------------------
  // OAuth + capture
  // ----------------------------------------------------------------------
  let accessToken: string
  try {
    accessToken = await getAccessToken()
  } catch (err) {
    await alertAdmin({
      severity: "critical",
      subject: "PayPal capture-order: could not get access token",
      body:
        "Buyer approved a PayPal popup payment but we could not get an OAuth token to capture. " +
        "Payment is APPROVED on PayPal's side but NOT captured. Buyer is waiting. Verify " +
        "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET in Vercel, then capture manually from " +
        "the PayPal dashboard.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        paypalEnv: safePaypalEnvLabel(),
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: "paypal:capture-order-token-failed",
    })
    return NextResponse.json({ error: "Authentication failed" }, { status: 503 })
  }

  let captureResponse: Response
  try {
    captureResponse = await fetch(
      `${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
      },
    )
  } catch (err) {
    const isTimeout =
      (err instanceof DOMException && err.name === "TimeoutError") ||
      (err instanceof Error && /aborted|timeout/i.test(err.message))
    await alertAdmin({
      severity: "critical",
      subject: isTimeout
        ? "PayPal capture-order: capture request TIMED OUT"
        : "PayPal capture-order: capture request THREW",
      body:
        "The capture POST to PayPal " + (isTimeout ? "exceeded 20 seconds" : "threw before returning") +
        ". Buyer's payment may or may not have been captured. Verify in the PayPal dashboard " +
        "and reconcile manually if needed.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        errorMessage: err instanceof Error ? err.message : String(err),
        paypalEnv: safePaypalEnvLabel(),
      },
      dedupKey: `paypal:capture-order-${isTimeout ? "timeout" : "threw"}:${orderId}`,
    })
    return NextResponse.json({ error: "Capture failed. Please try again." }, { status: 503 })
  }

  // 422 ORDER_ALREADY_CAPTURED → treat as success (buyer double-tapped).
  if (captureResponse.status === 422) {
    const body = await captureResponse.json().catch(() => null)
    const details = body && Array.isArray((body as any).details) ? (body as any).details : []
    const alreadyCaptured = details.some((d: any) => d?.issue === "ORDER_ALREADY_CAPTURED")
    if (alreadyCaptured) {
      await supabaseAdmin
        .from("pending_paypal_orders")
        .update({ status: "consumed", consumed_at: new Date().toISOString() })
        .eq("id", pending.id)
      return NextResponse.json({ success: true, alreadyConsumed: true, bookSlug: pending.book_slug })
    }
    await alertAdmin({
      severity: "error",
      subject: "PayPal capture-order: 422 not-already-captured",
      body: "PayPal rejected the popup-flow capture with a 422 that wasn't ORDER_ALREADY_CAPTURED.",
      details: { paypalOrderId: orderId, paypalIssue: (body as any)?.name, details },
      dedupKey: `paypal:capture-order-422:${orderId}`,
    })
    return NextResponse.json({ error: "Capture rejected by PayPal" }, { status: 422 })
  }

  if (!captureResponse.ok) {
    const body = await captureResponse.json().catch(() => ({} as any))
    await alertAdmin({
      severity: "critical",
      subject: "PayPal capture-order: capture FAILED — buyer didn't get charged",
      body:
        "Buyer approved a popup payment but the capture call failed. Buyer's card was NOT charged. " +
        "Investigate the PayPal response in the details below.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        status: captureResponse.status,
        paypalErrorName: body?.name,
        paypalDetails: body?.details,
        paypalEnv: safePaypalEnvLabel(),
      },
      dedupKey: `paypal:capture-order-failed:${orderId}`,
    })
    return NextResponse.json({ error: "Capture failed" }, { status: 502 })
  }

  // H2: A 2xx capture response does NOT by itself mean the money settled.
  // PayPal can return 2xx with the capture in a non-COMPLETED state
  // (PENDING for eCheck / risk-hold, etc). Parse the real capture status from
  // the response body before we treat this as a paid sale. Canonical path is
  // purchase_units[0].payments.captures[0].status; fall back to body.status.
  const captureBody = await captureResponse.json().catch(() => ({} as any))
  const captureStatus: string | undefined =
    captureBody?.purchase_units?.[0]?.payments?.captures?.[0]?.status ??
    captureBody?.status

  // Mark the pending row terminal REGARDLESS of capture status (the capture
  // call was made, so this orderId must never be replayable) — but with a
  // status that DISTINGUISHES a settled sale from a held one:
  //   COMPLETED → "consumed" (a reload returns success)
  //   anything else (PENDING / held) → "held" (a reload returns pending, never
  //   success — fulfillment waits for the webhook's COMPLETED event).
  const terminalStatus = captureStatus === "COMPLETED" ? "consumed" : "held"
  const { error: consumedUpdateError } = await supabaseAdmin
    .from("pending_paypal_orders")
    .update({ status: terminalStatus, consumed_at: new Date().toISOString() })
    .eq("id", pending.id)
  if (consumedUpdateError) {
    await alertAdmin({
      severity: "warning",
      subject: "PayPal capture-order: consumed-state update failed after successful capture",
      body:
        "Capture succeeded but updating pending_paypal_orders.status to 'consumed' failed. " +
        "The buyer was told their payment succeeded; a subsequent capture-order POST " +
        "would 404 if attempted (since the lookup still shows 'pending' until expiry).",
      details: { paypalOrderId: orderId, errorCode: consumedUpdateError.code },
      dedupKey: "paypal:capture-order-consumed-update-failed",
    })
  }

  // H2: capture is 2xx but NOT COMPLETED (e.g. PENDING eCheck/risk hold). Do
  // NOT report success to the buyer — fulfillment correctly waits for the
  // webhook's COMPLETED event. Alert so we can watch for held funds.
  if (captureStatus !== "COMPLETED") {
    await alertAdmin({
      severity: "critical",
      subject: "PayPal capture-order: capture not COMPLETED (held/pending)",
      body:
        "A popup-flow capture returned 2xx but the capture status is not COMPLETED. " +
        "The funds are likely PENDING (eCheck / risk hold). The buyer was NOT told the " +
        "purchase succeeded; fulfillment will happen if/when the webhook delivers a " +
        "COMPLETED event for this order.",
      details: {
        paypalOrderId: orderId,
        bookSlug: pending.book_slug,
        captureStatus: captureStatus ?? null,
        paypalEnv: safePaypalEnvLabel(),
      },
      dedupKey: `paypal:capture-order-not-completed:${orderId}`,
    })
    return NextResponse.json(
      { pending: true, message: "Your payment is processing and you'll get an email once it clears." },
      { status: 202 },
    )
  }

  return NextResponse.json({ success: true, bookSlug: pending.book_slug })
}
