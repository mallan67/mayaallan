import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createSessionExportOrder } from "@/lib/paypal"
import { renderAndEmailSessionPdf, isValidPromoCode } from "@/lib/deliver-pdf"
import { alertAdmin } from "@/lib/alert-admin"
import { safeLog, safeLogError, emailDomain, errorMessage } from "@/lib/safe-log"

export const runtime = "nodejs"
export const maxDuration = 60

type ExportRequest = {
  tool: "reset" | "belief_inquiry" | "integration"
  messages: Array<{ role: "user" | "assistant"; text: string }>
  email: string
  promoCode?: string
}

const MAX_MESSAGES = 50
const MAX_TEXT_LEN = 8000

function validateRequest(body: unknown): ExportRequest {
  if (!body || typeof body !== "object") throw new Error("Invalid body")
  const b = body as Record<string, unknown>

  const tool = b.tool
  if (tool !== "reset" && tool !== "belief_inquiry" && tool !== "integration") {
    throw new Error("Invalid tool")
  }

  const email = b.email
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email")
  }

  const messages = b.messages
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new Error("Invalid messages")
  }

  const normalized: ExportRequest["messages"] = []
  for (const m of messages) {
    if (!m || typeof m !== "object") throw new Error("Invalid message")
    const role = (m as Record<string, unknown>).role
    const text = (m as Record<string, unknown>).text
    if (role !== "user" && role !== "assistant") throw new Error("Invalid role")
    if (typeof text !== "string" || text.length === 0) throw new Error("Invalid text")
    if (text.length > MAX_TEXT_LEN) throw new Error("Text too long")
    normalized.push({ role, text })
  }

  const promoCode = typeof b.promoCode === "string" ? b.promoCode : undefined

  return { tool, email, messages: normalized, promoCode }
}

export async function POST(req: NextRequest) {
  let body: ExportRequest
  try {
    body = validateRequest(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    )
  }

  const sessionDate = new Date().toISOString()

  // ── Promo-code path: skip PayPal, deliver PDF directly ─────────
  if (body.promoCode) {
    if (!isValidPromoCode(body.promoCode)) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 })
    }

    try {
      await renderAndEmailSessionPdf({
        tool: body.tool,
        messages: body.messages,
        email: body.email,
        sessionDate,
      })
    } catch (err) {
      safeLogError("export.promo-deliver-failed", {
        tool: body.tool,
        recipientDomain: emailDomain(body.email),
        err: errorMessage(err),
      })
      // CRITICAL — promo redemption is a $0 path but the customer used a
      // code, expects a PDF, and we have no other way to fulfill. Manual
      // re-delivery required.
      await alertAdmin({
        severity: "critical",
        subject: "Export route: promo-code PDF delivery FAILED",
        body:
          "A customer redeemed a promo code for a session PDF but the render+email " +
          "step threw. Manual fulfillment required: re-run delivery for the affected " +
          "tool / session, or generate the PDF manually and email it to the customer.",
        details: {
          tool: body.tool,
          emailDomain: body.email.split("@")[1] ?? null,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
        dedupKey: "export:promo-deliver-failed",
      })
      return NextResponse.json({ error: "Could not deliver PDF" }, { status: 500 })
    }

    safeLog("export.promo-redeem", {
      tool: body.tool,
      recipientDomain: emailDomain(body.email),
      codeUsed: body.promoCode.trim().toUpperCase(),
    })

    return NextResponse.json({ promoApplied: true })
  }

  // ── Paid path: stage session in Blob, create PayPal order ─────
  const blobKey = `sessions/${crypto.randomUUID()}.json`
  const payload = {
    tool: body.tool,
    messages: body.messages,
    email: body.email,
    sessionDate,
  }

  try {
    await put(blobKey, JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })
  } catch (err) {
    safeLogError("export.blob-stage-failed", {
      tool: body.tool,
      err: errorMessage(err),
    })
    // No customer payment has happened yet — blob staging is pre-checkout —
    // but a persistent failure here means the entire session-export feature
    // is broken (paid path can't proceed). Alert as error (not critical)
    // and surface so it doesn't go silently dark.
    await alertAdmin({
      severity: "error",
      subject: "Export route: Vercel Blob staging failed — paid checkout cannot proceed",
      body:
        "Failed to stage the session payload in Vercel Blob. Customers clicking " +
        "'Save Session for $9.99' will see a 500. If this fires repeatedly, the " +
        "BLOB_READ_WRITE_TOKEN may be invalid / expired, or Vercel Blob is degraded.",
      details: { tool: body.tool, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "export:blob-stage-failed",
    })
    return NextResponse.json({ error: "Could not stage session" }, { status: 500 })
  }

  const origin = new URL(req.url).origin
  let checkout: { url: string; orderId: string }
  try {
    checkout = await createSessionExportOrder({
      blobKey,
      tool: body.tool,
      siteUrl: origin,
    })
  } catch (err) {
    safeLogError("export.create-order-failed", {
      tool: body.tool,
      err: errorMessage(err),
    })
    // No customer payment has happened — order creation is pre-checkout — but
    // a persistent failure here means the entire paid session-export flow is
    // unusable. Likely causes: PayPal OAuth credential issue, PayPal API
    // outage, or invalid PAYPAL_ENV. Alert as error.
    await alertAdmin({
      severity: "error",
      subject: "Export route: PayPal createOrder failed — paid checkout cannot proceed",
      body:
        "Failed to create a PayPal order for a session-export checkout. Customers " +
        "will see a 500 when clicking 'Save Session for $9.99'. Likely a PayPal " +
        "credential / OAuth issue or PayPal-side outage. Check /api/health?deep=1.",
      details: {
        tool: body.tool,
        blobKey,
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: "export:create-order-failed",
    })
    return NextResponse.json({ error: "Could not create checkout" }, { status: 500 })
  }

  return NextResponse.json({ checkoutUrl: checkout.url })
}
