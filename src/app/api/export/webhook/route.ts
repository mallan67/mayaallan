// Build-cache buster: 2026-05-20 cross-env verification-failure fix.
// Turbopack file-hash change forces this route's chunk to recompile.
import { NextRequest, NextResponse } from "next/server"
import {
  decodeCustomId,
  extractWebhookHeaders,
  safePaypalEnvLabel,
  verifyPaypalWebhook,
} from "@/lib/paypal"
import { renderAndEmailSessionPdf } from "@/lib/deliver-pdf"
import { readSession, deleteSession } from "@/lib/session-store"
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
    // Classify by cert-URL host vs configured PAYPAL_ENV (same logic as the
    // book-purchase webhook — see comment there for the full reasoning).
    // Cross-env failures get a warning + 200 (cleanup-style alert, won't
    // succeed via retry). Same-env failures get a critical + 200 (real
    // config mismatch, retries can't fix it either). Both use 24h dedup
    // windows so PayPal's 25× / 3-day retry schedule doesn't outlive dedup.
    let certHost: string | null = null
    try {
      certHost = headers.certUrl ? new URL(headers.certUrl).host : null
    } catch {
      certHost = null
    }
    const signedByEnv: "live" | "sandbox" | "unknown" = certHost
      ? certHost.endsWith("sandbox.paypal.com")
        ? "sandbox"
        : certHost.endsWith("paypal.com")
        ? "live"
        : "unknown"
      : "unknown"
    const ourEnv = safePaypalEnvLabel()
    const isCrossEnv =
      (signedByEnv === "sandbox" && ourEnv === "live") ||
      (signedByEnv === "live" && ourEnv === "sandbox")

    if (isCrossEnv) {
      await alertAdmin({
        severity: "warning",
        subject: `Export webhook: cross-env delivery (${signedByEnv} → ${ourEnv})`,
        body:
          `A PayPal webhook signed by ${signedByEnv.toUpperCase()} arrived at the export ` +
          `webhook in ${ourEnv.toUpperCase()} mode. Verification cannot succeed across ` +
          `PayPal environments. Most likely the ${signedByEnv} PayPal app still has an ` +
          `active webhook subscription pointed at this URL — log into PayPal Developer → ` +
          `${signedByEnv === "sandbox" ? "Sandbox" : "Live"} → your app → Webhooks and ` +
          `delete the subscription. Returning 200 to stop PayPal's retry storm.`,
        details: {
          ourEnv,
          signedByEnv,
          certUrlHost: certHost,
          transmissionIdPrefix: headers.transmissionId?.slice(0, 12) ?? null,
        },
        dedupKey: `export:cross-env:${signedByEnv}-to-${ourEnv}`,
        // 7-day dedup — same reasoning as the book webhook's cross-env path.
        dedupWindowMs: 7 * 24 * 60 * 60 * 1000,
      })
      return NextResponse.json({ received: true, ignored: "cross-env-webhook" })
    }

    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: signature verification FAILED",
      body:
        "An incoming PayPal webhook on /api/export/webhook failed signature verification, " +
        "and the cert URL host matches our configured PAYPAL_ENV — so this isn't a cross- " +
        "environment leak. PAYPAL_EXPORT_WEBHOOK_ID is almost certainly wrong (or an " +
        "attacker is probing). Verify the value against the webhook IDs listed in PayPal " +
        `Developer → ${ourEnv === "live" ? "Live" : "Sandbox"} → your app → Webhooks. ` +
        "Returning 200 to stop PayPal's retry storm.",
      details: {
        ourEnv,
        certUrlHost: certHost,
        transmissionIdPrefix: headers.transmissionId?.slice(0, 12) ?? null,
      },
      dedupKey: `export:signature-failure:${ourEnv}`,
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
    return NextResponse.json({ received: true, ignored: "verification-failed" })
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
        "been captured but the customId can't be decoded to a (sessionId, tool) " +
        "pair. Manual reconciliation required.",
      details: { customId },
      dedupKey: "export:bad-custom-id",
    })
    return NextResponse.json({ error: "Invalid custom_id" }, { status: 400 })
  }

  const { sessionId, tool } = decoded

  // ── Fetch session payload from storage (Upstash; blob fallback for in-flight)
  const readResult = await readSession(sessionId)

  if (readResult.status === "already-fulfilled") {
    // Legitimate PayPal retry of a previously-successful delivery, OR a
    // legacy blob session that was already cleaned up. Silent 200.
    return NextResponse.json({ ok: true, idempotent: true })
  }

  if (readResult.status === "not-found") {
    // CRITICAL — money captured but we have no record of staging this
    // session AND no record of previously fulfilling it. This is the
    // silent-failure bug class that previously delivered no PDF and
    // no alert. Now it alerts loudly.
    //
    // Likely causes:
    //   - Stage write failed silently before the PayPal order was created
    //     (impossible with current code paths — putSession throws on failure)
    //   - Upstash key mismatch (write went to one key, read tried another)
    //   - Upstash data was wiped between stage and fulfillment
    //   - The session is genuinely older than the TTL (24h) — extreme PayPal
    //     delivery delay
    //   - The custom_id was tampered with between checkout and webhook
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: PAID CAPTURE but session not found — manual fulfillment required",
      body:
        "A signature-verified PAYMENT.CAPTURE.COMPLETED event arrived for an " +
        "export-flow order, but no session payload exists in storage AND no " +
        "fulfillment marker exists. Money has moved but we cannot generate the " +
        "PDF automatically. Investigate immediately:\n" +
        "  1. Check Upstash for any key matching " + sessionId + "\n" +
        "  2. Look at /api/export logs from before the capture to see if the " +
        "stage write actually succeeded\n" +
        "  3. If the session is unrecoverable, refund the customer and apologize",
      details: {
        sessionId,
        customId,
        tool,
        // PayPal resource id for the capture — use this to find the order
        // in PayPal Business dashboard for refund.
        paymentResourceId: (event.resource as any)?.id ?? null,
      },
      dedupKey: `export:session-not-found:${sessionId}`,
    })
    // Still 200 — PayPal retrying this event won't help since the data is
    // genuinely missing. The alert is the action item; PayPal retries would
    // just spam the alert (deduped).
    return NextResponse.json({ ok: true, sessionNotFound: true })
  }

  // status === "found"
  const payload = readResult.payload

  if (payload.tool !== tool) {
    // Suspicious — custom_id said one tool, stored payload says another.
    // Could indicate a programming bug or a tampering attempt. Not fatal
    // (we proceed with the payload's tool field), but worth a warning.
    await alertAdmin({
      severity: "warning",
      subject: "Export webhook: tool mismatch between custom_id and stored session",
      body:
        "The tool extracted from PayPal's custom_id does not match the tool " +
        "field in the stored session payload. Investigate.",
      details: { customIdTool: tool, payloadTool: payload.tool, sessionId },
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
      // PII: omit the customer email. sessionId is sufficient for manual
      // reconciliation — Maya can look up the session in Upstash to find
      // the payload's email if needed (delete-on-success means it's gone
      // for successful flows). Keeping PII out of alertAdmin payloads is
      // the rule established in commit d01200b.
      details: {
        sessionId,
        tool,
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: `export:pdf-deliver-failed:${sessionId}`,
    })
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 })
  }

  try {
    await deleteSession(sessionId)
  } catch (err) {
    // Non-fatal — the customer already has their PDF; Upstash TTL is the
    // backstop for any orphaned sessions.
    console.error("Session deletion failed (non-fatal):", err)
    await alertAdmin({
      severity: "warning",
      subject: "Export webhook: session cleanup failed (non-fatal)",
      body:
        "Customer got their PDF but the staged session couldn't be deleted. " +
        "Upstash TTL (24h) will sweep it. If this fires repeatedly, investigate " +
        "the Upstash connection.",
      details: { sessionId, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "export:session-cleanup-failed",
    })
  }

  return NextResponse.json({ ok: true })
}
