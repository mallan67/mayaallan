/**
 * POST /api/admin/export/recover
 *
 * Manually fulfill a session-export order whose webhook delivery was missed
 * or silently dropped. Two known causes:
 *
 *   1. Pre-Upstash blob-staging bug (vercel/storage issue #470 — put()
 *      succeeds, but the public URL returns 404 when fetched). Affected
 *      orders from before commit 31bfee9 (the Upstash migration).
 *   2. PayPal webhook reliability — events occasionally stuck "pending"
 *      even though our endpoint returned 200, or never fire at all.
 *
 * Auth: admin session + same-origin CSRF guard.
 *
 * Input JSON body: { orderId: string, recipientEmail?: string }
 *   - orderId is the PayPal Order ID from the API call log or Activity tab
 *     (looks like `19669393M95070412`).
 *   - recipientEmail is optional. If omitted, uses the email from the staged
 *     session payload (the buyer's email). Provide explicitly to override
 *     for sending to a different address (e.g., resend to the merchant).
 *
 * Flow:
 *   1. Fetch the order from PayPal — extracts custom_id + payer.email_address
 *   2. Decode custom_id → sessionId + tool
 *   3. Try readSession(sessionId) (Upstash, then legacy blob fallback)
 *   4. If found → render PDF + email to recipient
 *   5. If not found → return a structured response so the operator knows
 *      what to do next (e.g., reconstruct manually)
 *
 * Returns 200 with a JSON status report describing what was attempted and
 * what was delivered.
 */
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"
import { fetchOrderById, decodeCustomId } from "@/lib/paypal"
import { readSession } from "@/lib/session-store"
import { renderAndEmailSessionPdf } from "@/lib/deliver-pdf"
import { alertAdmin } from "@/lib/alert-admin"
import { safeLog, safeLogError, emailDomain, errorMessage } from "@/lib/safe-log"

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"

type RecoverRequest = {
  orderId: string
  recipientEmail?: string
}

function validateBody(body: unknown): RecoverRequest {
  if (!body || typeof body !== "object") throw new Error("Invalid body")
  const b = body as Record<string, unknown>
  const orderId = b.orderId
  if (typeof orderId !== "string" || !/^[A-Z0-9]{10,30}$/i.test(orderId)) {
    throw new Error("Invalid orderId")
  }
  const recipientEmail =
    typeof b.recipientEmail === "string" && b.recipientEmail.length > 0
      ? b.recipientEmail
      : undefined
  if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    throw new Error("Invalid recipientEmail")
  }
  return { orderId, recipientEmail }
}

export async function POST(req: Request) {
  // CSRF first, then session — same pattern as other admin mutating routes.
  const guard = assertAdminSameOrigin(req)
  if (!guard.ok) return guard.response

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: RecoverRequest
  try {
    body = validateBody(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    )
  }

  // ── Fetch the order from PayPal ─────────────────────────────────
  let order
  try {
    order = await fetchOrderById(body.orderId)
  } catch (err) {
    safeLogError("admin-export-recover.paypal-fetch-failed", {
      orderId: body.orderId,
      err: errorMessage(err),
    })
    return NextResponse.json(
      { error: "PayPal order fetch failed", details: errorMessage(err) },
      { status: 502 }
    )
  }

  // Status sanity check — only fulfill COMPLETED captures.
  const orderStatus = order.status
  const purchaseUnit = order.purchase_units?.[0]
  const customId = purchaseUnit?.custom_id
  const captures = purchaseUnit?.payments?.captures ?? []
  const completedCapture = captures.find((c) => c.status === "COMPLETED")

  if (!completedCapture) {
    return NextResponse.json(
      {
        error: "Order has no completed capture — nothing to fulfill",
        orderId: body.orderId,
        orderStatus,
        captureStatuses: captures.map((c) => c.status),
      },
      { status: 409 }
    )
  }

  if (!customId) {
    return NextResponse.json(
      { error: "Order has no custom_id — cannot identify session", orderId: body.orderId },
      { status: 422 }
    )
  }

  const decoded = decodeCustomId(customId)
  if (!decoded) {
    return NextResponse.json(
      {
        error: "Order custom_id does not match expected session-export shape",
        orderId: body.orderId,
        customId,
      },
      { status: 422 }
    )
  }

  const { sessionId, tool } = decoded

  // ── Look up the session payload ─────────────────────────────────
  const readResult = await readSession(sessionId)

  if (readResult.status === "already-fulfilled") {
    return NextResponse.json({
      status: "already-fulfilled",
      message:
        "Session is marked fulfilled (PDF was previously delivered, or this is " +
        "a legacy blob session that was already cleaned up). No re-delivery " +
        "from the staged payload is possible.",
      orderId: body.orderId,
      sessionId,
      tool,
    })
  }

  if (readResult.status === "not-found") {
    // The original session payload is gone. Cannot reconstruct PDF from PayPal
    // alone — we never stored the chat transcript on PayPal's side. Operator
    // must either contact customer for their chat history, or issue a refund.
    return NextResponse.json(
      {
        status: "session-not-found",
        message:
          "PayPal capture is real, but the session payload is missing from " +
          "Upstash AND not present as a legacy blob. The original chat " +
          "transcript is unrecoverable from our storage. Options: (a) contact " +
          "the customer for their chat history and reconstruct manually, " +
          "(b) refund the order and apologize.",
        orderId: body.orderId,
        sessionId,
        tool,
        capturedAmount: completedCapture.amount,
        payerEmail: order.payer?.email_address ?? null,
      },
      { status: 410 } // Gone — resource was once available but no longer is
    )
  }

  // status === "found"
  const payload = readResult.payload

  // Sanity check: payload tool should match custom_id tool.
  if (payload.tool !== tool) {
    safeLogError("admin-export-recover.tool-mismatch", {
      sessionId,
      customIdTool: tool,
      payloadTool: payload.tool,
    })
    // Continue with payload's tool (more authoritative) but warn.
  }

  // Override recipient if explicitly provided. SECURITY CONSTRAINT: the
  // override is limited to the same email domain as the buyer's address.
  // A compromised admin account otherwise becomes a one-click exfiltration
  // tool — an attacker who learns any real PayPal order ID can resend the
  // customer's full chat-transcript PDF to attacker@evil.com. Same-domain
  // override still allows legitimate use cases (resend to a +suffix alias,
  // a shared inbox at the buyer's domain), while preventing exfiltration
  // to an unrelated third party.
  const buyerEmail = payload.email
  const buyerDomain = emailDomain(buyerEmail)
  let recipientEmail = buyerEmail
  if (body.recipientEmail) {
    const overrideDomain = emailDomain(body.recipientEmail)
    if (!overrideDomain || !buyerDomain || overrideDomain !== buyerDomain) {
      safeLogError("admin-export-recover.override-rejected", {
        orderId: body.orderId,
        sessionId,
        buyerDomain,
        overrideDomain,
      })
      await alertAdmin({
        severity: "warning",
        subject: "Admin export-recover: cross-domain recipient override REJECTED",
        body:
          "An operator attempted to redirect a session-PDF delivery to a recipient " +
          "whose email domain does not match the buyer's. This is blocked: same-domain " +
          "overrides are allowed (resend to a +suffix alias), but cross-domain overrides " +
          "would be an exfiltration channel if admin credentials are ever compromised. " +
          "If this rejection is unexpected, contact the buyer directly to confirm.",
        details: { orderId: body.orderId, sessionId, buyerDomain, overrideDomain },
        dedupKey: `admin-export-recover:cross-domain:${sessionId}`,
      })
      return NextResponse.json(
        {
          error: "Cross-domain recipient override is not allowed",
          orderId: body.orderId,
          buyerDomain,
          attemptedDomain: overrideDomain,
        },
        { status: 403 },
      )
    }
    recipientEmail = body.recipientEmail
  }

  // ── Render + email the PDF ──────────────────────────────────────
  //
  // Idempotency key uses a 10-second time bucket — not a stable key —
  // because this route is OPERATOR-TRIGGERED for intentional re-delivery.
  // A stable `admin-recover-${sessionId}` would dedupe across 24h and
  // block a legitimate second attempt (e.g., first delivery bounced, the
  // operator is retrying with a different email). The 10-second bucket
  // catches:
  //   - accidental double-clicks on the Recover button (sub-second apart)
  //   - browser/network retries of the POST (typically sub-5-second)
  // …while letting a deliberate retry 10+ seconds later go through.
  const recoverBucket = Math.floor(Date.now() / 10_000)
  try {
    await renderAndEmailSessionPdf(
      {
        tool: payload.tool,
        messages: payload.messages,
        email: recipientEmail,
        sessionDate: payload.sessionDate,
      },
      { idempotencyKey: `admin-recover-${sessionId}-${recoverBucket}` },
    )
  } catch (err) {
    safeLogError("admin-export-recover.deliver-failed", {
      orderId: body.orderId,
      sessionId,
      recipientDomain: emailDomain(recipientEmail),
      err: errorMessage(err),
    })
    await alertAdmin({
      severity: "critical",
      subject: "Admin export-recover: PDF delivery FAILED on manual fulfillment",
      body:
        "An operator-triggered recovery for a stuck session export failed at " +
        "the render+email step. Check Resend dashboard + Vercel logs.",
      details: {
        orderId: body.orderId,
        sessionId,
        tool: payload.tool,
        errorMessage: errorMessage(err),
      },
      dedupKey: `admin-export-recover:deliver-failed:${sessionId}`,
    })
    return NextResponse.json(
      { error: "Render or email failed", details: errorMessage(err) },
      { status: 500 }
    )
  }

  safeLog("admin-export-recover.delivered", {
    orderId: body.orderId,
    sessionId,
    tool: payload.tool,
    recipientDomain: emailDomain(recipientEmail),
  })

  // If the recipient differs from the buyer's address (same domain, but a
  // different mailbox — e.g. a +suffix alias or a shared inbox), fire an
  // info-level alert so the operator has a paper trail. Always alert on
  // any recovery delivery so admin-compromise leaves footprints in the
  // alert inbox.
  await alertAdmin({
    severity: "info",
    subject: "Admin export-recover: PDF re-delivered",
    body:
      "An operator manually re-delivered a session-export PDF via /admin/export-recover. " +
      "If this was not an authorized operator action, treat the admin account as " +
      "compromised: rotate ADMIN_PASSWORD_HASH and SESSION_SECRET, then audit recent " +
      "logins.",
    details: {
      orderId: body.orderId,
      sessionId,
      tool: payload.tool,
      recipientDomain: emailDomain(recipientEmail),
      overrideUsed: !!body.recipientEmail,
    },
    dedupKey: `admin-export-recover:delivered:${sessionId}`,
  })

  return NextResponse.json({
    status: "delivered",
    message: "PDF rendered and emailed to recipient.",
    orderId: body.orderId,
    sessionId,
    tool: payload.tool,
    recipientDomain: emailDomain(recipientEmail),
    capturedAmount: completedCapture.amount,
  })
}
