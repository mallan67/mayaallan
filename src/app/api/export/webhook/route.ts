import { NextRequest, NextResponse } from "next/server"
import { head, del } from "@vercel/blob"
import { renderToBuffer } from "@react-pdf/renderer"
import { Resend } from "resend"
import { verifyLemonSqueezySignature } from "@/lib/lemonsqueezy"
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

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-signature")

  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const meta = (event as { meta?: { event_name?: string; custom_data?: Record<string, string> } }).meta
  const eventName = meta?.event_name
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true, ignored: eventName })
  }

  const custom = meta?.custom_data ?? {}
  const blobKey = custom.blob_key
  const tool = custom.tool as BlobPayload["tool"] | undefined

  if (!blobKey || !tool) {
    console.error("Webhook missing blob_key/tool in custom_data")
    return NextResponse.json({ error: "Missing custom data" }, { status: 400 })
  }

  let payload: BlobPayload
  try {
    const blobMeta = await head(blobKey)
    const res = await fetch(blobMeta.url)
    if (!res.ok) throw new Error(`blob fetch ${res.status}`)
    payload = (await res.json()) as BlobPayload
  } catch (err) {
    console.error("Blob fetch failed:", err)
    return NextResponse.json({ error: "Session data not available" }, { status: 500 })
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
