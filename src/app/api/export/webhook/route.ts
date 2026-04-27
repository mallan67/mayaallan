import { NextRequest, NextResponse } from "next/server"
import { head, del } from "@vercel/blob"
import { renderToBuffer } from "@react-pdf/renderer"
import { Resend } from "resend"
import {
  decodeCustomId,
  extractWebhookHeaders,
  verifyPaypalWebhook,
} from "@/lib/paypal"
import { SessionPdf, type PdfMessage } from "@/lib/pdf/template"

export const runtime = "nodejs"
export const maxDuration = 60

type BlobPayload = {
  tool: "reset" | "belief_inquiry" | "integration"
  messages: PdfMessage[]
  email: string
  sessionDate: string
}

const TOOL_DISPLAY = {
  reset: "Nervous System Reset",
  belief_inquiry: "Belief Inquiry",
  integration: "Integration",
} as const

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

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(
      SessionPdf({
        tool: payload.tool,
        messages: payload.messages,
        sessionDate: payload.sessionDate,
      })
    )
  } catch (err) {
    console.error("PDF render failed:", err)
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error("RESEND_API_KEY not set")
    return NextResponse.json({ error: "Email service unavailable" }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const displayName = TOOL_DISPLAY[payload.tool]
  try {
    await resend.emails.send({
      from: "Maya Allan <hello@mayaallan.com>",
      to: payload.email,
      subject: `Your ${displayName} session keepsake`,
      text: `Hi,\n\nThank you for keeping your ${displayName} session. Your PDF is attached.\n\nWith care,\nMaya`,
      attachments: [
        {
          filename: `${payload.tool}-session.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    })
  } catch (err) {
    console.error("Email send failed:", err)
    return NextResponse.json({ error: "Email failed" }, { status: 500 })
  }

  try {
    await del(blobKey)
  } catch (err) {
    console.error("Blob deletion failed (non-fatal):", err)
  }

  return NextResponse.json({ ok: true })
}
