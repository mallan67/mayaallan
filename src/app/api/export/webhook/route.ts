import { NextRequest, NextResponse } from "next/server"
import { head, del } from "@vercel/blob"
import {
  decodeCustomId,
  extractWebhookHeaders,
  verifyPaypalWebhook,
} from "@/lib/paypal"
import {
  renderAndEmailSessionPdf,
  type SessionPayload as BlobPayload,
} from "@/lib/deliver-pdf"
import { alertAdmin } from "@/lib/alert-admin"

export const runtime = "nodejs"
export const maxDuration = 60

type CaptureResource = {
  custom_id?: string
  supplementary_data?: {
    related_ids?: { order_id?: string }
  }
}

// This route only processes PAYMENT.CAPTURE.COMPLETED (gated below). The
// previous CHECKOUT.ORDER.APPROVED branch was unreachable dead code; if it's
// ever reintroduced, accepting APPROVED would deliver the PDF before the money
// is captured. Keep this single-shape.
function extractCustomId(resource: unknown): string | null {
  if (!resource || typeof resource !== "object") return null
  return (resource as CaptureResource).custom_id ?? null
}

export async function POST(req: NextRequest) {
  // Fail-fast guard: in production, refuse to process any event unless we
  // have the export-specific webhook ID set. Without it, verifyPaypalWebhook
  // would silently fall back to PAYPAL_WEBHOOK_ID (the book webhook's ID),
  // which would only verify successfully against book-route signatures and
  // would either misroute or false-fail every export event.
  if (
    (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") &&
    !process.env.PAYPAL_EXPORT_WEBHOOK_ID
  ) {
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: PAYPAL_EXPORT_WEBHOOK_ID not configured in production",
      body:
        "/api/export/webhook is reachable but PAYPAL_EXPORT_WEBHOOK_ID is unset. " +
        "Without it the route would fall back to PAYPAL_WEBHOOK_ID and fail to " +
        "verify any export-flow event. Set the env var in Vercel Production scope " +
        "and redeploy.",
      dedupKey: "export:missing-export-webhook-id",
    })
    return NextResponse.json({ error: "Service misconfigured" }, { status: 500 })
  }

  const rawBody = await req.text()
  const headers = extractWebhookHeaders(req)

  // Verify against PAYPAL_EXPORT_WEBHOOK_ID (this route's own subscription),
  // NOT the book-purchase PAYPAL_WEBHOOK_ID.
  let verified = false
  try {
    verified = await verifyPaypalWebhook(headers, rawBody, process.env.PAYPAL_EXPORT_WEBHOOK_ID)
  } catch (err) {
    console.error("PayPal webhook verification error:", err)
    // Verification threw — most likely a network error talking to PayPal, but
    // it could also be a misconfigured PAYPAL_WEBHOOK_ID. Dedup'd so bot probes
    // don't flood the inbox.
    await alertAdmin({
      severity: "error",
      subject: "Export webhook: signature verification THREW",
      body:
        "verifyPaypalWebhook threw before returning a true/false result. " +
        "If this fires repeatedly the verify endpoint is unreachable or " +
        "PAYPAL_WEBHOOK_ID is misconfigured.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "export:signature-verify-threw",
    })
  }
  if (!verified) {
    // Heavily dedup'd — webhook endpoints get probed by bots constantly.
    // Without dedup this would email Maya every few seconds.
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: signature verification FAILED",
      body:
        "An incoming PayPal webhook on /api/export/webhook failed signature " +
        "verification. Could be an attacker probing the endpoint, or a real " +
        "misconfiguration (PAYPAL_WEBHOOK_ID for the SESSION-PDF webhook is " +
        "wrong). Check Vercel function logs for source IP + frequency.",
      dedupKey: "export:signature-failure",
    })
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: { event_type?: string; resource?: unknown }
  try {
    event = JSON.parse(rawBody)
  } catch {
    // PayPal sent malformed JSON after signature passed — extremely unusual,
    // worth knowing about. Don't include the raw body in the alert (leak risk).
    await alertAdmin({
      severity: "error",
      subject: "Export webhook: signed payload was invalid JSON",
      body:
        "A signature-verified webhook contained malformed JSON. This shouldn't " +
        "happen with real PayPal traffic — investigate.",
      dedupKey: "export:invalid-json",
    })
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventName = event.event_type

  // Refund / dispute / reversal events on the session-PDF flow. We don't auto-
  // process them, but Maya must be notified — silently dropping these is a
  // real operational gap.
  if (
    eventName === "PAYMENT.CAPTURE.REFUNDED" ||
    eventName === "PAYMENT.CAPTURE.REVERSED" ||
    (typeof eventName === "string" && eventName.startsWith("CUSTOMER.DISPUTE."))
  ) {
    await alertAdmin({
      severity: "warning",
      subject: `Export webhook: ${eventName}`,
      body:
        "A refund / reversal / dispute event was received on the session-PDF " +
        "PayPal subscription. We don't process these automatically — review in " +
        "the PayPal Business dashboard and take action as needed.",
      details: { eventName, paypalOrderId: (event.resource as any)?.id ?? null },
      dedupKey: `export:${eventName}`,
    })
    return NextResponse.json({ received: true, alerted: eventName })
  }

  if (eventName !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, ignored: eventName })
  }

  const customId = extractCustomId(event.resource)

  // Silently skip cross-flow events. PayPal delivers each capture event to
  // every webhook subscription on the app, so book captures arrive at this
  // URL too. The session-export contract is custom_id === `blobKey|tool`
  // (always contains a literal `|`). Anything else — missing custom_id,
  // numeric book id, future product shape — gets a quiet 200. Symmetric with
  // the book webhook, which skips anything containing `|`.
  if (typeof customId !== "string" || !customId.includes("|")) {
    return NextResponse.json({ received: true, ignored: "cross-flow" })
  }

  const decoded = decodeCustomId(customId)
  if (!decoded) {
    console.error("Webhook custom_id failed to decode:", customId)
    // CRITICAL — same as above: money in, can't fulfill.
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: paid capture has unparseable custom_id",
      body:
        "decodeCustomId() returned null for a paid PayPal capture. Money has " +
        "been captured but the customId can't be decoded to a (blobKey, tool) " +
        "pair. Manual reconciliation required.",
      details: { customId },
      dedupKey: "export:bad-custom-id",
    })
    return NextResponse.json({ error: "Invalid custom_id" }, { status: 400 })
  }

  const { blobKey, tool } = decoded

  let payload: BlobPayload
  try {
    const blobMeta = await head(blobKey)
    // 10s timeout — a slow blob fetch would otherwise chew the 60s function
    // budget and force PayPal to retry an in-progress fulfillment.
    const res = await fetch(blobMeta.url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`blob fetch ${res.status}`)
    payload = (await res.json()) as BlobPayload
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("not found") || msg.includes("BlobNotFound") || msg.includes("404")) {
      // Already-processed — the blob was deleted at the end of a previous
      // successful run. Idempotent acknowledgement.
      return NextResponse.json({ ok: true, idempotent: true })
    }
    console.error("Blob fetch failed:", err)
    // CRITICAL — money in, payload unreachable, can't fulfill.
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: blob fetch failed — paid customer cannot get PDF",
      body:
        "Failed to fetch the session payload from Vercel Blob after a successful " +
        "PayPal capture. The customer has paid but the source data for their PDF " +
        "is unreachable. Manual reconciliation: check the blob, re-generate the " +
        "PDF if possible, and email the customer.",
      details: { blobKey, tool, errorMessage: msg },
      dedupKey: `export:blob-fetch-failed:${blobKey}`,
    })
    return NextResponse.json({ error: "Session data not available" }, { status: 500 })
  }

  if (payload.tool !== tool) {
    // Suspicious — custom_id said one tool, blob says another. Could indicate
    // a programming bug or a tampering attempt. Not fatal (we proceed with the
    // payload's tool field), but worth a warning.
    await alertAdmin({
      severity: "warning",
      subject: "Export webhook: tool mismatch between custom_id and blob",
      body:
        "The tool extracted from PayPal's custom_id does not match the tool " +
        "field in the stored blob payload. Investigate.",
      details: { customIdTool: tool, blobTool: payload.tool, blobKey },
      dedupKey: "export:tool-mismatch",
    })
  }

  try {
    await renderAndEmailSessionPdf(payload)
  } catch (err) {
    console.error("PDF render/email failed:", err)
    // CRITICAL — money in, PDF NOT delivered. The most important alert in
    // this whole route: every failure here represents a real customer who
    // paid and didn't get their product.
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: PDF render/email FAILED — paid customer didn't get their PDF",
      body:
        "renderAndEmailSessionPdf threw after a successful PayPal capture. " +
        "The customer paid for the session PDF but it was NOT delivered. " +
        "Manual fulfillment required: re-run delivery with the payload below, " +
        "or generate the PDF manually and email it to the customer.",
      // PII: omit the customer email. blobKey is sufficient for manual
      // reconciliation — Maya can look up the blob to find the payload's
      // email if needed. Keeping PII out of alertAdmin payloads is the rule
      // established in commit d01200b.
      details: {
        blobKey,
        tool,
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: `export:pdf-deliver-failed:${blobKey}`,
    })
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 })
  }

  try {
    await del(blobKey)
  } catch (err) {
    // Non-fatal — the customer already has their PDF. But blob cleanup
    // failures left unchecked could accumulate storage cost over time.
    console.error("Blob deletion failed (non-fatal):", err)
    await alertAdmin({
      severity: "warning",
      subject: "Export webhook: blob cleanup failed (non-fatal)",
      body:
        "Customer got their PDF but the source blob couldn't be deleted. If " +
        "this fires repeatedly, stale blobs are piling up in storage.",
      details: { blobKey, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "export:blob-cleanup-failed",
    })
  }

  return NextResponse.json({ ok: true })
}
