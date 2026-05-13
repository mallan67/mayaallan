/**
 * GET /api/checkout/paypal/return — PayPal post-approval landing.
 *
 * The hole this plugs:
 *   Our checkout/create flow uses Orders v2 with intent: "CAPTURE". The customer
 *   is redirected to PayPal's approval URL; once they click "Pay Now" the order
 *   is APPROVED but NOT yet captured. With the redirect (server-side) flow,
 *   the merchant MUST explicitly call /v2/checkout/orders/<id>/capture for the
 *   payment to actually move. Without this call the customer's card is never
 *   charged, no PAYMENT.CAPTURE.COMPLETED webhook fires, and no order row /
 *   download token / email is ever created.
 *
 *   PayPal redirects here on approval with ?token=<ORDER_ID>&PayerID=<...>.
 *   This route captures the order and then bounces the customer to the
 *   book page with ?payment=success. The webhook does the rest (idempotent;
 *   it dedupes by paypal_order_id from PR #6).
 *
 * Why GET (not POST):
 *   PayPal's return_url is opened by the customer's browser as a navigation,
 *   which is always GET. We cannot change that.
 *
 * Idempotency:
 *   If the customer reloads this URL after a successful capture, PayPal
 *   responds with ORDER_ALREADY_CAPTURED. We treat that as success and
 *   redirect normally — the webhook already fired (or will), and the
 *   webhook handler itself dedupes on paypal_order_id.
 */
import { NextResponse, type NextRequest } from "next/server"
import { alertAdmin } from "@/lib/alert-admin"

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com"

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_SECRET
  if (!clientId || !clientSecret) return null

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch {
    return null
  }
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

function redirectToBook(bookSlug: string | null, status: "success" | "cancelled" | "error"): NextResponse {
  // If bookSlug is missing for any reason, bounce home rather than 404.
  const path = bookSlug ? `/books/${encodeURIComponent(bookSlug)}` : "/"
  return NextResponse.redirect(`${siteUrl()}${path}?payment=${status}`, { status: 303 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const orderId = searchParams.get("token") // PayPal calls the order ID "token" in the return URL
  const bookSlug = searchParams.get("bookSlug")

  if (!orderId) {
    // PayPal didn't pass back an order ID — most likely the customer hit the
    // cancel button or refreshed the URL after the params dropped. Treat as
    // cancellation (not an error worth alerting on).
    return redirectToBook(bookSlug, "cancelled")
  }

  const accessToken = await getPayPalAccessToken()
  if (!accessToken) {
    await alertAdmin({
      severity: "critical",
      subject: "PayPal return: could not get access token to capture order",
      body:
        "A customer approved a PayPal payment but we could not get an OAuth token to capture it. " +
        "The payment is sitting in APPROVED state on PayPal's side, NOT captured. The customer is " +
        "looking at our site right now wondering what happened. Verify PAYPAL_CLIENT_ID and " +
        "PAYPAL_SECRET in Vercel env vars, then capture manually from the PayPal dashboard.",
      details: { paypalOrderId: orderId, bookSlug },
      dedupKey: "paypal:return-token-failed",
    })
    return redirectToBook(bookSlug, "error")
  }

  let captureResponse: Response
  try {
    captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          // PayPal requires a unique request id only if we want idempotency
          // on retries; since we treat ORDER_ALREADY_CAPTURED as success
          // we can leave this off and rely on PayPal's natural dedup.
        },
      }
    )
  } catch (err) {
    await alertAdmin({
      severity: "critical",
      subject: "PayPal return: capture request THREW",
      body:
        "The capture POST to PayPal threw before returning. The customer's payment may or may not " +
        "have been captured. Manual reconciliation required — verify in PayPal dashboard.",
      details: { paypalOrderId: orderId, bookSlug, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: `paypal:return-capture-threw:${orderId}`,
    })
    return redirectToBook(bookSlug, "error")
  }

  // Idempotency: if the customer reloads this route after a successful capture
  // PayPal returns 422 with name=UNPROCESSABLE_ENTITY and issue=ORDER_ALREADY_CAPTURED.
  // That's our "everything is fine" signal — the webhook already fired (or will).
  if (captureResponse.status === 422) {
    const body = await captureResponse.json().catch(() => ({} as any))
    const alreadyCaptured = (body?.details ?? []).some(
      (d: any) => d?.issue === "ORDER_ALREADY_CAPTURED"
    )
    if (alreadyCaptured) {
      return redirectToBook(bookSlug, "success")
    }
    // Some other 422 — fall through to error path below
    await alertAdmin({
      severity: "error",
      subject: "PayPal return: capture rejected with 422",
      body: "PayPal rejected the capture request with a 422. Customer's payment is not captured.",
      details: { paypalOrderId: orderId, bookSlug, paypalIssue: body?.name, details: body?.details },
      dedupKey: `paypal:return-capture-422:${orderId}`,
    })
    return redirectToBook(bookSlug, "error")
  }

  if (!captureResponse.ok) {
    const body = await captureResponse.json().catch(() => ({} as any))
    await alertAdmin({
      severity: "critical",
      subject: "PayPal return: capture FAILED — customer didn't get charged",
      body:
        "A customer approved a payment on PayPal but the subsequent capture call failed. " +
        "The customer's card was NOT charged. They're now sitting on the book page wondering " +
        "what happened. Investigate the PayPal response in the details below.",
      details: {
        paypalOrderId: orderId,
        bookSlug,
        status: captureResponse.status,
        paypalErrorName: body?.name,
        paypalDetails: body?.details,
      },
      dedupKey: `paypal:return-capture-failed:${orderId}`,
    })
    return redirectToBook(bookSlug, "error")
  }

  // Success path — PayPal captured the money. The PAYMENT.CAPTURE.COMPLETED
  // webhook will fire (or has already fired) and our webhook handler does the
  // order row + token + email work. Send the customer to the friendly success
  // landing page on the book detail route.
  return redirectToBook(bookSlug, "success")
}
