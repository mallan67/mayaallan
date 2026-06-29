import { NextRequest, NextResponse } from "next/server"
import { createSessionExportOrder } from "@/lib/paypal"
import { renderAndEmailSessionPdf, isValidPromoCode } from "@/lib/deliver-pdf"
import { alertAdmin } from "@/lib/alert-admin"
import { safeLog, safeLogError, emailDomain, errorMessage } from "@/lib/safe-log"
import { putSession } from "@/lib/session-store"
import { MIN_USER_TURNS_FOR_EXPORT } from "@/lib/pdf/extract-insights"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { assertPublicSameOrigin } from "@/lib/marketing-origin"

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
  let userTurnCount = 0
  for (const m of messages) {
    if (!m || typeof m !== "object") throw new Error("Invalid message")
    const role = (m as Record<string, unknown>).role
    const text = (m as Record<string, unknown>).text
    if (role !== "user" && role !== "assistant") throw new Error("Invalid role")
    if (typeof text !== "string" || text.length === 0) throw new Error("Invalid text")
    if (text.length > MAX_TEXT_LEN) throw new Error("Text too long")
    normalized.push({ role, text })
    if (role === "user") userTurnCount += 1
  }

  // Minimum-conversation gate. The previous behavior allowed the "Print
  // this session — $9.99" button to fire at turn 1, which let a buyer
  // pay $9.99 for a PDF containing one question and no anchor. Below
  // MIN_USER_TURNS_FOR_EXPORT the conversation is too thin to produce
  // a useful keepsake — and a refund risk for the operator.
  if (userTurnCount < MIN_USER_TURNS_FOR_EXPORT) {
    throw new Error("Conversation too short")
  }

  const promoCode = typeof b.promoCode === "string" ? b.promoCode : undefined

  return { tool, email, messages: normalized, promoCode }
}

export async function POST(req: NextRequest) {
  // CSRF: only our own tools pages should drive session export.
  const originGuard = assertPublicSameOrigin(req)
  if (!originGuard.ok) return originGuard.response

  const ip = getClientIp(req)

  // General per-IP envelope across BOTH the paid and promo paths. Bounds
  // unauthenticated abuse: staging Upstash sessions, creating PayPal orders,
  // and rendering/emailing PDFs all cost resources.
  const limit = await rateLimit({
    scope: "export",
    ip,
    windowMs: 60 * 60 * 1000,
    maxAttempts: 15,
    lockoutMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } },
    )
  }

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
    // Stricter per-IP limit on the promo branch specifically. This runs
    // BEFORE the validity check so it throttles brute-force guessing of the
    // (human-memorable) promo codes — and the attachment-email send that a
    // valid code triggers — independent of the general envelope above.
    const promoLimit = await rateLimit({
      scope: "export-promo",
      ip,
      windowMs: 60 * 60 * 1000,
      maxAttempts: 5,
      lockoutMs: 60 * 60 * 1000,
    })
    if (!promoLimit.allowed) {
      return NextResponse.json(
        { error: "Too many promo attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(promoLimit.retryAfterSeconds ?? 60) } },
      )
    }

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

  // ── Paid path: stage session in Upstash, create PayPal order ─────
  // Session payload (transcript + email) lives in Upstash with a 24h TTL.
  // The PayPal custom_id carries the opaque session id; the webhook reads
  // it back after capture. No more public-blob writes for sensitive content.
  let sessionId: string
  try {
    sessionId = await putSession({
      tool: body.tool,
      messages: body.messages,
      email: body.email,
      sessionDate,
    })
  } catch (err) {
    safeLogError("export.session-stage-failed", {
      tool: body.tool,
      err: errorMessage(err),
    })
    // session-store.putSession() already alerts on the production-without-
    // Upstash case via its own critical alert. Surface a generic error here.
    await alertAdmin({
      severity: "error",
      subject: "Export route: session staging failed — paid checkout cannot proceed",
      body:
        "Failed to stage the session payload. Customers clicking " +
        "'Save Session for $9.99' will see a 500. If this fires repeatedly, " +
        "Upstash Redis is degraded or env vars are misconfigured. " +
        "Check /api/health?deep=1.",
      details: { tool: body.tool, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "export:session-stage-failed",
    })
    return NextResponse.json({ error: "Could not stage session" }, { status: 500 })
  }

  const origin = new URL(req.url).origin
  let checkout: { url: string; orderId: string }
  try {
    checkout = await createSessionExportOrder({
      sessionId,
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
        sessionId,
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: "export:create-order-failed",
    })
    return NextResponse.json({ error: "Could not create checkout" }, { status: 500 })
  }

  return NextResponse.json({ checkoutUrl: checkout.url })
}
