/**
 * Shared session-PDF delivery: render PDF, send via Resend.
 * Used by:
 *   - PayPal webhook (paid flow)
 *   - /api/export (promo-code flow that bypasses PayPal)
 */
import { renderToBuffer } from "@react-pdf/renderer"
import { Resend } from "resend"
import { SessionPdf, type PdfMessage } from "@/lib/pdf/template"

export type SessionPayload = {
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

export async function renderAndEmailSessionPdf(payload: SessionPayload): Promise<void> {
  const pdfBuffer = await renderToBuffer(
    SessionPdf({
      tool: payload.tool,
      messages: payload.messages,
      sessionDate: payload.sessionDate,
    })
  )

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    throw new Error("RESEND_API_KEY not set")
  }

  const resend = new Resend(resendKey)
  const displayName = TOOL_DISPLAY[payload.tool]

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
}

/**
 * Promo-code validation against PROMO_CODES env var.
 * Format: comma-separated, e.g. PROMO_CODES="MAYA10,LAUNCH26,WORKSHOP"
 * Matching is trimmed + case-insensitive.
 */
export function isValidPromoCode(input: string | undefined | null): boolean {
  if (!input) return false
  const normalized = input.trim().toUpperCase()
  if (!normalized) return false
  const codes = (process.env.PROMO_CODES ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
  return codes.includes(normalized)
}
