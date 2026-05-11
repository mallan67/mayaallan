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
  }
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: { event_type?: string; resource?: unknown }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventName = event.event_type
  if (eventName !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, ignored: eventName })
  }

  const customId = extractCustomId(eventName, event.resource)
  if (!customId) {
    console.error("Webhook missing custom_id on resource")
    return NextResponse.json({ error: "Missing custom_id" }, { status: 400 })
  }

  const decoded = decodeCustomId(customId)
  if (!decoded) {
    console.error("Webhook custom_id failed to decode:", customId)
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
      console.log("Blob already processed (idempotent), acknowledging:", blobKey)
      return NextResponse.json({ ok: true, idempotent: true })
    }
    console.error("Blob fetch failed:", err)
    return NextResponse.json({ error: "Session data not available" }, { status: 500 })
  }

  if (payload.tool !== tool) {
    console.error("Tool mismatch between custom_id and blob:", { customId: tool, blob: payload.tool })
  }

  try {
    await renderAndEmailSessionPdf(payload)
  } catch (err) {
    console.error("PDF render/email failed:", err)
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 })
  }

  try {
    await del(blobKey)
  } catch (err) {
    console.error("Blob deletion failed (non-fatal):", err)
  }

  return NextResponse.json({ ok: true })
}
