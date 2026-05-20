/**
 * Shared handler for the per-tool session-export PayPal webhooks.
 *
 * Architecture (post-refactor): instead of a single /api/export/webhook
 * that handled all three AI tools, we now have three per-tool routes:
 *
 *   /api/export/webhook/belief-inquiry  → expectedTool="belief_inquiry"
 *   /api/export/webhook/integration     → expectedTool="integration"
 *   /api/export/webhook/reset           → expectedTool="reset"
 *
 * Each route registers its own PayPal webhook subscription and has its
 * own webhook ID env var. This isolates each tool's monetization fully:
 * a webhook misconfiguration on one tool can't break the others, and
 * each tool can be disabled in PayPal independently.
 *
 * This handler factors out the shared verification + fulfillment work so
 * each per-tool route is a small wrapper.
 */
import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { decodeCustomId, extractWebhookHeaders, verifyPaypalWebhook } from "@/lib/paypal"
import { renderAndEmailSessionPdf } from "@/lib/deliver-pdf"
import { readSession, deleteSession } from "@/lib/session-store"
import { alertAdmin } from "@/lib/alert-admin"

export type ExportTool = "reset" | "belief_inquiry" | "integration"

export type ExportWebhookConfig = {
  /** Which tool's events this webhook subscription is responsible for. */
  expectedTool: ExportTool
  /** The Vercel env var NAME holding this webhook's PayPal webhook ID. */
  webhookIdEnvVar: string
  /**
   * Short identifier used in alert dedupKeys and admin-email subject
   * lines so Maya can tell at a glance which per-tool route fired.
   * Example: "belief", "integration", "reset".
   */
  routeName: string
}

type CaptureResource = {
  custom_id?: string
  supplementary_data?: { related_ids?: { order_id?: string } }
}

function extractCustomId(resource: unknown): string | null {
  if (!resource || typeof resource !== "object") return null
  return (resource as CaptureResource).custom_id ?? null
}

export async function handleExportWebhook(
  req: NextRequest,
  config: ExportWebhookConfig,
): Promise<NextResponse> {
  const { expectedTool, webhookIdEnvVar, routeName } = config
  const webhookId = process.env[webhookIdEnvVar]

  // ---------------------------------------------------------------
  // Fail-fast guard: refuse to process events if THIS route's webhook
  // ID env var isn't set in production. Without it, verifyPaypalWebhook
  // would silently fall back to PAYPAL_WEBHOOK_ID (the book webhook's
  // ID) and either misroute or false-fail every event for this tool.
  // ---------------------------------------------------------------
  if (
    (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") &&
    !webhookId
  ) {
    await alertAdmin({
      severity: "critical",
      subject: `Export webhook (${routeName}): ${webhookIdEnvVar} not configured in production`,
      body:
        `/api/export/webhook/${routeName} is reachable but ${webhookIdEnvVar} is unset in ` +
        "Vercel Production. Without it the route can't verify signatures and would either " +
        "fail every event or misroute via the book-webhook fallback. Set the env var in " +
        "Vercel Production scope and redeploy.",
      dedupKey: `export-${routeName}:missing-webhook-id`,
    })
    return NextResponse.json({ error: "Service misconfigured" }, { status: 500 })
  }

  const rawBody = await req.text()
  const headers = extractWebhookHeaders(req)

  // ---------------------------------------------------------------
  // Signature verification — distinguish bot probes from real PayPal
  // events. PayPal real events always carry the five paypal-* headers;
  // bots scanning common webhook URL patterns don't.
  // ---------------------------------------------------------------
  const hasPaypalShape =
    !!headers.transmissionId && !!headers.transmissionSig && !!headers.certUrl
  if (!hasPaypalShape) {
    // Bot probe — silent 401, no alert.
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let verified = false
  try {
    verified = await verifyPaypalWebhook(headers, rawBody, webhookId)
  } catch (err) {
    console.error(`[export-${routeName}] PayPal webhook verification error:`, err)
    await alertAdmin({
      severity: "error",
      subject: `Export webhook (${routeName}): signature verification THREW`,
      body:
        "verifyPaypalWebhook threw before returning a true/false result. Most likely a " +
        "network error talking to PayPal's verify endpoint, or PayPal API outage. PayPal " +
        "will retry valid events.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: `export-${routeName}:verify-threw`,
    })
  }
  if (!verified) {
    await alertAdmin({
      severity: "critical",
      subject: `Export webhook (${routeName}): signature verification FAILED`,
      body:
        `An incoming PayPal webhook on /api/export/webhook/${routeName} had the expected ` +
        `shape but failed signature verification. Most likely ${webhookIdEnvVar} is wrong ` +
        "(not matching the webhook subscription this URL was registered against in PayPal). " +
        "Less likely: tampering attempt. Check Vercel function logs.",
      dedupKey: `export-${routeName}:signature-failure`,
    })
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // ---------------------------------------------------------------
  // Parse + classify event
  // ---------------------------------------------------------------
  let event: { event_type?: string; resource?: unknown }
  try {
    event = JSON.parse(rawBody)
  } catch {
    await alertAdmin({
      severity: "error",
      subject: `Export webhook (${routeName}): signed payload was invalid JSON`,
      body: "A signature-verified webhook contained malformed JSON. Investigate.",
      dedupKey: `export-${routeName}:invalid-json`,
    })
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventName = event.event_type

  // Refund / dispute / reversal events — alert for operator visibility.
  if (
    eventName === "PAYMENT.CAPTURE.REFUNDED" ||
    eventName === "PAYMENT.CAPTURE.REVERSED" ||
    (typeof eventName === "string" && eventName.startsWith("CUSTOMER.DISPUTE."))
  ) {
    await alertAdmin({
      severity: "warning",
      subject: `Export webhook (${routeName}): ${eventName}`,
      body:
        `A refund / reversal / dispute event was received on the ${routeName} session-PDF ` +
        "PayPal subscription. We don't process these automatically — review in the PayPal " +
        "Business dashboard and take action as needed.",
      details: { eventName, paypalOrderId: (event.resource as any)?.id ?? null },
      dedupKey: `export-${routeName}:${eventName}`,
    })
    return NextResponse.json({ received: true, alerted: eventName })
  }

  if (eventName !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, ignored: eventName })
  }

  const customId = extractCustomId(event.resource)

  // Cross-flow filter: this route handles session-export only. Anything
  // without a `|` in custom_id is a book purchase (or future product
  // shape) and belongs to another route entirely. Silent skip.
  if (typeof customId !== "string" || !customId.includes("|")) {
    return NextResponse.json({ received: true, ignored: "cross-flow" })
  }

  const decoded = decodeCustomId(customId)
  if (!decoded) {
    await alertAdmin({
      severity: "critical",
      subject: `Export webhook (${routeName}): paid capture has unparseable custom_id`,
      body:
        "decodeCustomId() returned null for a paid PayPal capture on this route. Money " +
        "captured but sessionId/tool can't be extracted. Manual reconciliation required.",
      details: { customId },
      dedupKey: `export-${routeName}:bad-custom-id`,
    })
    return NextResponse.json({ error: "Invalid custom_id" }, { status: 400 })
  }

  const { sessionId, tool } = decoded

  // ---------------------------------------------------------------
  // Defense in depth: each per-tool webhook only processes its OWN tool.
  // If PayPal somehow delivers a different tool's event here (cross-
  // subscription noise, misrouting, race after webhook reconfig), refuse
  // and 200 silently — the correct per-tool webhook will get the event.
  // ---------------------------------------------------------------
  if (tool !== expectedTool) {
    return NextResponse.json({
      received: true,
      ignored: "wrong-tool",
      expected: expectedTool,
      got: tool,
    })
  }

  // ---------------------------------------------------------------
  // Fetch staged session payload (Upstash; legacy blob fallback for
  // in-flight orders created before the Upstash migration)
  // ---------------------------------------------------------------
  const readResult = await readSession(sessionId)

  if (readResult.status === "already-fulfilled") {
    // Legitimate PayPal retry of a previously-successful delivery, OR a
    // legacy blob session that was already cleaned up. Silent 200.
    return NextResponse.json({ ok: true, idempotent: true })
  }

  if (readResult.status === "not-found") {
    // CRITICAL — paid capture but no session found AND no fulfillment marker.
    // See route.ts handler for full rationale; this is the silent-failure
    // bug class that previously delivered nothing without alerting.
    await alertAdmin({
      severity: "critical",
      subject: `Export webhook (${routeName}): PAID CAPTURE but session not found — manual fulfillment required`,
      body:
        "A signature-verified PAYMENT.CAPTURE.COMPLETED event arrived but no " +
        "session payload exists in storage AND no fulfillment marker exists. " +
        "Money has moved but we cannot generate the PDF automatically.",
      details: {
        sessionId,
        customId,
        tool,
        paymentResourceId: (event.resource as { id?: string } | undefined)?.id ?? null,
      },
      dedupKey: `export-${routeName}:session-not-found:${sessionId}`,
    })
    return NextResponse.json({ ok: true, sessionNotFound: true })
  }

  // status === "found"
  const payload = readResult.payload

  // Sanity check: payload's tool field should match what custom_id said
  // (and what THIS route expects). A mismatch suggests a programming bug or
  // a tampering attempt.
  if (payload.tool !== tool) {
    await alertAdmin({
      severity: "warning",
      subject: `Export webhook (${routeName}): tool mismatch between custom_id and stored session`,
      body:
        "The tool extracted from PayPal's custom_id does not match the tool field in the " +
        "stored session payload. We continue fulfillment using the payload's tool, but " +
        "investigate this asymmetry.",
      details: { routeExpected: expectedTool, customIdTool: tool, payloadTool: payload.tool, sessionId },
      dedupKey: `export-${routeName}:tool-mismatch`,
    })
  }

  // ---------------------------------------------------------------
  // Render + email the session PDF
  // ---------------------------------------------------------------
  try {
    await renderAndEmailSessionPdf(payload)
  } catch (err) {
    await alertAdmin({
      severity: "critical",
      subject: `Export webhook (${routeName}): PDF render/email FAILED — paid customer didn't get their PDF`,
      body:
        "renderAndEmailSessionPdf threw after a successful PayPal capture. The customer " +
        "paid for the session PDF but it was NOT delivered. Manual fulfillment required.",
      // PII (customer email) deliberately omitted — present in the Upstash
      // session record if needed for manual fulfillment (24h TTL).
      details: {
        sessionId,
        tool,
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: `export-${routeName}:pdf-deliver-failed:${sessionId}`,
    })
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 })
  }

  // ---------------------------------------------------------------
  // Cleanup the staged session (non-fatal if it fails — Upstash TTL sweeps)
  // ---------------------------------------------------------------
  try {
    await deleteSession(sessionId)
  } catch (err) {
    await alertAdmin({
      severity: "warning",
      subject: `Export webhook (${routeName}): session cleanup failed (non-fatal)`,
      body:
        "Customer got their PDF but the staged session couldn't be deleted. " +
        "Upstash TTL (24h) will sweep it. If this fires repeatedly, investigate " +
        "the Upstash connection.",
      details: { sessionId, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: `export-${routeName}:session-cleanup-failed`,
    })
  }

  return NextResponse.json({ ok: true })
}
