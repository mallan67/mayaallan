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

type OrderApprovedResource = {
  purchase_units?: Array<{ custom_id?: string }>
}

function extractCustomId(eventName: string, resource: unknown): string | null {
  if (!resource || typeof resource !== "object") return null
  if (eventName === "PAYMENT.CAPTURE.COMPLETED") {
    return (resource as CaptureResource).custom_id ?? null
  }
  if (eventName === "CHECKOUT.ORDER.APPROVED") {
    const units = (resource as OrderApprovedResource).purchase_units
    return units?.[0]?.custom_id ?? null
  }
  return null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const headers = extractWebhookHeaders(req)

  let verified = false
  try {
    verified = await verifyPaypalWebhook(headers, rawBody)
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
  if (eventName !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, ignored: eventName })
  }

  const customId = extractCustomId(eventName, event.resource)
  if (!customId) {
    console.error("Webhook missing custom_id on resource")
    // CRITICAL — money was captured by PayPal but we can't tell which session
    // this is for. Cannot fulfill without manual intervention.
    await alertAdmin({
      severity: "critical",
      subject: "Export webhook: paid capture missing custom_id — cannot fulfill",
      body:
        "A PAYMENT.CAPTURE.COMPLETED event arrived with no custom_id on the " +
        "resource. Money has been captured by PayPal but we have no idea which " +
        "session PDF to deliver. Manual reconciliation required: look up the " +
        "capture in PayPal, find the customer, and re-send the session PDF.",
      details: { eventName },
      dedupKey: "export:missing-custom-id",
    })
    return NextResponse.json({ error: "Missing custom_id" }, { status: 400 })
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
    const res = await fetch(blobMeta.url)
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
      details: {
        blobKey,
        tool,
        customerEmail: (payload as any)?.email,
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
