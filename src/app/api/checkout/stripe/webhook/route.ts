/**
 * POST /api/checkout/stripe/webhook — Stripe webhook handler.
 *
 * Architecture mirrors the hardened PayPal webhook in
 * src/app/api/payment/paypal/webhook/route.ts but adapted for Stripe's
 * cleaner event model:
 *   - signature verification via stripe.webhooks.constructEvent
 *   - idempotency on stripe_session_id (the orders table column is dual-
 *     purpose for now: PayPal stores paypal_order_id, Stripe stores
 *     stripe_session_id in the same row using the same canonical column)
 *   - silent skip of events for the OTHER flow (book vs session-export)
 *   - atomic email-send claim via claim_download_email_send RPC (reused
 *     unchanged from the PayPal flow)
 *   - refund / dispute alerting for operator visibility
 *
 * Events processed:
 *   - checkout.session.completed       — primary fulfillment trigger
 *   - charge.refunded                  — operator-visibility alert only
 *   - charge.dispute.created           — operator-visibility alert only
 *   - all other event_types            — silently 200 (we may add more
 *                                        subscriptions later without code
 *                                        changes)
 */
import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { Resend } from "resend"
import { alertAdmin } from "@/lib/alert-admin"
import {
  decodeCheckoutMetadata,
  getStripe,
  safeStripeModeLabel,
  verifyStripeWebhook,
} from "@/lib/stripe"
import { renderAndEmailSessionPdf, type SessionPayload } from "@/lib/deliver-pdf"
import { head, del } from "@vercel/blob"
import { siteUrl } from "@/lib/site-url"
import { emailDomain } from "@/lib/safe-log"
import crypto from "crypto"
import type Stripe from "stripe"

export const runtime = "nodejs"
export const maxDuration = 60

// --------------------------------------------------------------------
// Book-purchase delivery email — mirrors sendPurchaseEmail in the PayPal
// webhook, with a 15s Promise.race timeout cap on the Resend call.
// --------------------------------------------------------------------
async function sendBookPurchaseEmail(args: {
  customerEmail: string
  customerName: string | null
  bookTitle: string
  downloadUrl: string
  expiresAt: Date
  maxDownloads: number
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { ok: false, error: "RESEND_API_KEY not configured" }

  const resend = new Resend(resendKey)
  const greeting = args.customerName ? `Hi ${args.customerName.split(" ")[0]}` : "Hi"
  const expiryStr = args.expiresAt.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })
  const escape = (s: string) =>
    s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!))

  try {
    const sendPromise = resend.emails.send({
      from: "Maya Allan <maya@mayaallan.com>",
      to: args.customerEmail,
      subject: `Your purchase from mayaallan.com — ${args.bookTitle}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; line-height: 1.55; color: #14110d;">
          <p>${escape(greeting)},</p>
          <p>Thank you for your purchase. Your download link for <strong>${escape(args.bookTitle)}</strong> is below.</p>
          <p style="margin: 32px 0;">
            <a href="${args.downloadUrl}"
               style="display: inline-block; padding: 14px 32px; background: #0A0A0D; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">
              Download ${escape(args.bookTitle)}
            </a>
          </p>
          <p style="font-size: 13px; color: #6B665E;">
            This link is valid for up to <strong>${args.maxDownloads} downloads</strong> and expires on <strong>${expiryStr}</strong>.
          </p>
          <p style="font-size: 13px; color: #6B665E;">
            Trouble downloading? Reply to this email and I'll send a fresh link.
          </p>
          <p style="margin-top: 32px;">With care,<br/>Maya</p>
        </div>
      `,
    })
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Resend send timed out after 15s")), 15_000),
    )
    const { data, error } = await Promise.race([sendPromise, timeoutPromise])
    if (error) return { ok: false, error: error.message ?? String(error) }
    return { ok: true, id: data?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}

// --------------------------------------------------------------------
// Main webhook handler
// --------------------------------------------------------------------
export async function POST(request: Request) {
  // Read raw body FIRST — Stripe signature verification needs exact bytes.
  // Any JSON.parse before this would re-serialize and break verification.
  const rawBody = await request.text()
  const signatureHeader = request.headers.get("stripe-signature")

  // -- Verify signature ----------------------------------------------
  let event: Stripe.Event
  try {
    event = verifyStripeWebhook(rawBody, signatureHeader)
  } catch (err) {
    // Triage: distinguish "missing signature / nonsense body" (bot probe)
    // from "real Stripe traffic with a bad signature" (worth alerting).
    // Stripe webhooks ALWAYS send a stripe-signature header on real events.
    const hasStripeShape = !!signatureHeader && signatureHeader.includes("t=") && signatureHeader.includes("v1=")
    if (!hasStripeShape) {
      // Bot probe — silently 401 without alerting.
      console.log("[stripe-webhook] bot probe (no/invalid signature header)")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
    // Real-shaped signature that failed to verify. Could be: tampered body,
    // wrong webhook secret, OR Stripe's signature timestamp drift (>5min).
    // Alert as warning (not critical) — Stripe will retry valid events.
    console.error("Stripe webhook verification failed:", err)
    await alertAdmin({
      severity: "warning",
      subject: "Stripe webhook: signature verification FAILED",
      body:
        "An incoming Stripe webhook with real-shaped headers failed signature " +
        "verification. Most likely STRIPE_WEBHOOK_SECRET is misconfigured or " +
        "doesn't match the endpoint that fired this event. Less likely: a " +
        "tampering attempt. Check Vercel logs for the source IP.",
      details: {
        stripeMode: safeStripeModeLabel(),
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: "stripe:signature-failure",
    })
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // -- Refund / dispute visibility (operator-only alert) -------------
  if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
    const obj = event.data.object as Stripe.Charge | Stripe.Dispute
    await alertAdmin({
      severity: "warning",
      subject: `Stripe: ${event.type}`,
      body:
        "A refund or dispute event arrived from Stripe. Review in the Stripe " +
        "Dashboard and take action as needed (respond to dispute, reconcile " +
        "order status, contact customer).",
      details: {
        eventType: event.type,
        stripeId: obj.id,
        stripeMode: safeStripeModeLabel(),
      },
      dedupKey: `stripe:${event.type}`,
    })
    return NextResponse.json({ received: true, alerted: event.type })
  }

  // -- Only checkout.session.completed triggers fulfillment ----------
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const stripeSessionId = session.id

  // -- Discriminate flow via structured metadata ---------------------
  const decoded = decodeCheckoutMetadata(session.metadata as Stripe.Metadata | null)
  if (!decoded) {
    // Unknown metadata shape — could be a manual Payment Link Maya created
    // outside our flows, or a future flow we haven't wired. Silently 200
    // so Stripe stops retrying; alert ONCE with the session id for triage.
    await alertAdmin({
      severity: "warning",
      subject: "Stripe webhook: checkout.session.completed with unknown metadata shape",
      body:
        "A Stripe Checkout Session completed but its metadata doesn't match " +
        "either of our known flows (book purchase, session export). Likely a " +
        "manually-created Payment Link or a future flow we haven't wired yet. " +
        "Reconcile manually if this is a real customer order.",
      // PII rule (d01200b): no full customer email in alert payloads.
      details: { stripeSessionId, customerDomain: emailDomain(session.customer_details?.email) },
      dedupKey: `stripe:unknown-metadata:${stripeSessionId}`,
    })
    return NextResponse.json({ received: true, ignored: "unknown-metadata" })
  }

  try {
    if (decoded.kind === "book_purchase") {
      return await handleBookPurchase(session, stripeSessionId, decoded.book_id, decoded.book_slug)
    }
    if (decoded.kind === "session_export") {
      return await handleSessionExport(session, stripeSessionId, decoded.blob_key, decoded.tool)
    }
    // Exhaustive: TypeScript should ensure we never reach here, but be defensive.
    return NextResponse.json({ received: true, ignored: "unhandled-kind" })
  } catch (err) {
    console.error("Stripe webhook handler threw:", err)
    await alertAdmin({
      severity: "critical",
      subject: "Stripe webhook handler threw an unexpected error",
      body:
        "The Stripe webhook handler threw after signature verification succeeded. " +
        "Customer money may have been captured; order/token may or may not exist. " +
        "Check Vercel function logs immediately and reconcile against Stripe.",
      details: {
        stripeSessionId,
        kind: decoded.kind,
        errorMessage: err instanceof Error ? err.message : String(err),
      },
      dedupKey: "stripe:handler-threw",
    })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// --------------------------------------------------------------------
// Book purchase fulfillment — ports the PayPal book-webhook idempotency
// + claim-RPC pattern directly, swapping paypal_order_id → stripe_session_id.
// --------------------------------------------------------------------
async function handleBookPurchase(
  session: Stripe.Checkout.Session,
  stripeSessionId: string,
  bookIdStr: string,
  bookSlug: string,
): Promise<NextResponse> {
  const bookId = parseInt(bookIdStr, 10)
  if (!Number.isInteger(bookId) || bookId <= 0) {
    await alertAdmin({
      severity: "critical",
      subject: "Stripe book purchase: unparseable book_id in metadata",
      body:
        "A checkout.session.completed event for a book purchase had a non-integer book_id in its " +
        "metadata. Cannot fulfill without manual reconciliation.",
      details: { stripeSessionId, bookIdStr, bookSlug },
      dedupKey: `stripe:book-bad-id:${stripeSessionId}`,
    })
    return NextResponse.json({ received: true, ignored: "bad-book-id" })
  }

  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? null
  const customerName = session.customer_details?.name ?? null
  const amount =
    typeof session.amount_total === "number" ? session.amount_total / 100 : 0
  const currency = (session.currency ?? "usd").toLowerCase()

  if (!customerEmail) {
    await alertAdmin({
      severity: "critical",
      subject: "Stripe book purchase: no customer email — cannot deliver",
      body:
        "A Stripe checkout completed but no email was collected. Buyer paid; we cannot deliver " +
        "the download link. Reconcile manually from the Stripe Dashboard.",
      details: { stripeSessionId, bookId },
      dedupKey: `stripe:no-email:${stripeSessionId}`,
    })
    return NextResponse.json({ received: true, ignored: "no-customer-email" })
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from(Tables.books)
    .select("*")
    .eq("id", bookId)
    .single()

  if (bookError || !book) {
    await alertAdmin({
      severity: "critical",
      subject: "Stripe book purchase: book row not found",
      body: "A Stripe checkout completed for a book_id that doesn't exist in the database.",
      details: { stripeSessionId, bookId, errorCode: bookError?.code },
      dedupKey: `stripe:book-not-found:${bookId}`,
    })
    return NextResponse.json({ received: true, ignored: "book-not-found" })
  }

  // ---- Idempotency pre-check ----
  // paypal_order_id is dual-purpose: it stores PayPal order ids for PayPal
  // sales AND Stripe checkout session ids for Stripe sales. The unique index
  // catches duplicates across both flows.
  const { data: existingOrder } = await supabaseAdmin
    .from(Tables.orders)
    .select("*")
    .eq("paypal_order_id", stripeSessionId)
    .maybeSingle()

  let order: any
  let reusableToken: { id: number; token: string; expires_at: string; max_downloads: number | null; email_sent_at: string | null } | null = null
  let resumingExistingOrder = false

  if (existingOrder) {
    const { data: existingToken } = await supabaseAdmin
      .from(Tables.downloadTokens)
      .select("id, token, expires_at, max_downloads, email_sent_at")
      .eq("order_id", existingOrder.id)
      .maybeSingle()

    if (existingToken?.email_sent_at) {
      return NextResponse.json({ received: true, deduplicated: true, orderId: existingOrder.id })
    }
    if (existingToken) reusableToken = existingToken
    resumingExistingOrder = true
    order = existingOrder
  } else {
    const { data: insertedOrder, error: orderError } = await supabaseAdmin
      .from(Tables.orders)
      .insert({
        // Legacy NOT NULL columns (Stripe-era retains these for back-compat
        // with admin dashboard / CSV exports / historical queries).
        customer_email: customerEmail,
        amount_cents: Math.round(amount * 100),
        email: customerEmail,
        customer_name: customerName,
        paypal_order_id: stripeSessionId, // dual-purpose column — see comment above
        book_id: book.id,
        format_type: "ebook",
        amount,
        currency,
        payment_provider: "stripe",
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError || !insertedOrder) {
      // 23505 = concurrent webhook race. Re-select.
      if (orderError?.code === "23505") {
        const { data: racedOrder } = await supabaseAdmin
          .from(Tables.orders)
          .select("*")
          .eq("paypal_order_id", stripeSessionId)
          .maybeSingle()
        if (racedOrder) {
          const { data: racedToken } = await supabaseAdmin
            .from(Tables.downloadTokens)
            .select("id, token, expires_at, max_downloads, email_sent_at")
            .eq("order_id", racedOrder.id)
            .maybeSingle()
          if (racedToken?.email_sent_at) {
            return NextResponse.json({ received: true, deduplicated: true, raced: true, orderId: racedOrder.id })
          }
          if (racedToken) reusableToken = racedToken
          resumingExistingOrder = true
          order = racedOrder
        }
      }
      if (!order) {
        await alertAdmin({
          severity: "critical",
          subject: "Stripe: payment received but order INSERT failed",
          body:
            "Buyer money was captured by Stripe but writing the order row to Supabase failed. " +
            "Reconcile manually from the Stripe Dashboard.",
          details: { stripeSessionId, bookId, amount, currency, errorCode: orderError?.code },
          dedupKey: `stripe:order-insert-failed:${stripeSessionId}`,
        })
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
      }
    } else {
      order = insertedOrder
    }
  }

  if (resumingExistingOrder) {
    await alertAdmin({
      severity: "warning",
      subject: "Stripe webhook: resuming previously-failed fulfillment",
      body:
        "An order row already existed for this Stripe session but the delivery email " +
        "hadn't been sent. Resuming token creation / email delivery now.",
      details: { orderId: order.id, stripeSessionId },
      dedupKey: `stripe:resume-fulfillment:${stripeSessionId}`,
    })
  }

  // ---- Download token + delivery email ----
  if (!book.ebook_file_url) {
    console.warn("Order", order.id, "completed but book", book.id, "has no ebook_file_url")
    return NextResponse.json({ success: true, orderId: order.id, warning: "No ebook file URL set for this book" })
  }

  let tokenRowId: number
  let tokenValue: string
  let tokenExpiresAt: Date
  let tokenMaxDownloads: number

  if (reusableToken) {
    tokenRowId = reusableToken.id
    tokenValue = reusableToken.token
    tokenExpiresAt = new Date(reusableToken.expires_at)
    tokenMaxDownloads = reusableToken.max_downloads ?? 5
  } else {
    const newToken = crypto.randomBytes(32).toString("hex")
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 30)

    const { data: downloadToken, error: tokenError } = await supabaseAdmin
      .from(Tables.downloadTokens)
      .insert({
        token: newToken,
        order_id: order.id,
        book_id: book.id,
        max_downloads: 5,
        expires_at: newExpiresAt.toISOString(),
      })
      .select("id, token, expires_at, max_downloads, email_sent_at")
      .single()

    if (tokenError || !downloadToken) {
      await alertAdmin({
        severity: "critical",
        subject: "Stripe order completed but token creation FAILED",
        body: "Buyer paid via Stripe but download-token creation failed. Manual fulfillment required.",
        details: { orderId: order.id, stripeSessionId, bookId: book.id, errorCode: tokenError?.code },
        dedupKey: `stripe:token-insert-failed:${stripeSessionId}`,
      })
      return NextResponse.json({ error: "Order completed but token creation failed" }, { status: 500 })
    }
    tokenRowId = downloadToken.id
    tokenValue = downloadToken.token
    tokenExpiresAt = new Date(downloadToken.expires_at)
    tokenMaxDownloads = downloadToken.max_downloads ?? 5
  }

  // ---- Atomic email-send claim (reused from PayPal webhook) ----
  const workerId = `vercel:${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}:${crypto.randomBytes(8).toString("hex")}`
  const { data: claimRows, error: claimError } = await supabaseAdmin.rpc("claim_download_email_send", {
    p_token: tokenValue,
    p_worker_id: workerId,
    p_stale_timeout_seconds: 600,
  })

  if (claimError) {
    await alertAdmin({
      severity: "critical",
      subject: "Stripe webhook: email-send claim RPC failed",
      body: "claim_download_email_send errored. Returning 500 so Stripe retries.",
      details: { orderId: order.id, errorCode: claimError.code, errorMessage: claimError.message },
      dedupKey: "stripe:claim-rpc-failed",
    })
    return NextResponse.json({ error: "Service temporarily unavailable. Stripe will retry." }, { status: 500 })
  }

  const claimResult = Array.isArray(claimRows) ? claimRows[0] : claimRows
  if (!claimResult || claimResult.status === "not_found") {
    await alertAdmin({
      severity: "critical",
      subject: "Stripe webhook: token row vanished before email claim",
      body: "Claim RPC reports no row for the token we just inserted. Investigate.",
      details: { orderId: order.id, tokenRowId },
      dedupKey: "stripe:claim-no-row",
    })
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 })
  }
  if (claimResult.status === "already_sent") {
    return NextResponse.json({ received: true, deduplicated: true, orderId: order.id })
  }
  if (claimResult.status === "claimed_by_other") {
    return NextResponse.json({ error: "Concurrent fulfillment in progress" }, { status: 500 })
  }

  // claimResult.status === "ok" — we own the email send.
  const downloadUrl = `${siteUrl()}/download/${tokenValue}`
  const emailResult = await sendBookPurchaseEmail({
    customerEmail,
    customerName,
    bookTitle: book.title,
    downloadUrl,
    expiresAt: tokenExpiresAt,
    maxDownloads: tokenMaxDownloads,
  })

  if (!emailResult.ok) {
    await supabaseAdmin.rpc("release_download_email_claim", {
      p_token: tokenValue,
      p_worker_id: workerId,
    })
    await alertAdmin({
      severity: "error",
      subject: "Stripe: order completed but delivery email failed",
      body:
        "Order + token are valid but Resend rejected the send. Claim released so the next " +
        "Stripe retry (or a manual resend) can try again.",
      details: { orderId: order.id, stripeSessionId, bookId: book.id, resendError: emailResult.error },
      dedupKey: `stripe:email-failed:${stripeSessionId}`,
    })
    return NextResponse.json({ error: "Order completed but delivery email failed" }, { status: 500 })
  }

  const { error: sentUpdateError } = await supabaseAdmin
    .from(Tables.downloadTokens)
    .update({
      email_sent_at: new Date().toISOString(),
      email_send_claimed_at: null,
      email_send_claimed_by: null,
    })
    .eq("id", tokenRowId)

  if (sentUpdateError) {
    await alertAdmin({
      severity: "warning",
      subject: "Stripe webhook: email delivered but email_sent_at update failed",
      body:
        "Email delivered, but updating email_sent_at failed. A retry could send a duplicate after " +
        "the 10-minute claim window expires.",
      details: { orderId: order.id, tokenRowId, errorCode: sentUpdateError.code },
      dedupKey: "stripe:email-sent-update-failed",
    })
  }

  // ---- Analytics (3s hard cap — best-effort only, must not delay 200) ----
  try {
    const analyticsPromise = (async () => {
      const { data: pendingRow } = await supabaseAdmin
        .from("pending_paypal_orders")
        .select("visitor_id, session_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_page, referrer")
        .eq("paypal_order_id", stripeSessionId)
        .maybeSingle()

      const attribution = pendingRow as any

      await supabaseAdmin.from("marketing_events").insert({
        visitor_id: attribution?.visitor_id ?? null,
        session_id: attribution?.session_id ?? null,
        event_name: "purchase_completed",
        path: "/api/checkout/stripe/webhook",
        referrer: attribution?.referrer ?? null,
        utm_source: attribution?.utm_source ?? null,
        utm_medium: attribution?.utm_medium ?? null,
        utm_campaign: attribution?.utm_campaign ?? null,
        utm_content: attribution?.utm_content ?? null,
        utm_term: attribution?.utm_term ?? null,
        properties: {
          order_id: order.id,
          stripe_session_id: stripeSessionId,
          amount,
          currency,
          book_id: book.id,
          title: typeof book.title === "string" ? book.title.slice(0, 128) : null,
          processor: "stripe",
          fulfillment_status: "completed",
        },
      })

      if (attribution) {
        await supabaseAdmin
          .from(Tables.orders)
          .update({
            visitor_id: attribution.visitor_id,
            session_id: attribution.session_id,
            utm_source: attribution.utm_source,
            utm_medium: attribution.utm_medium,
            utm_campaign: attribution.utm_campaign,
            landing_page: attribution.landing_page,
            referrer: attribution.referrer,
          })
          .eq("id", order.id)
      }
    })()
    const analyticsTimeout = new Promise<void>((resolve) => setTimeout(() => resolve(), 3_000))
    await Promise.race([analyticsPromise, analyticsTimeout])
  } catch (trackErr) {
    console.error("[stripe webhook] purchase tracking failed:", trackErr)
  }

  return NextResponse.json({ success: true, orderId: order.id })
}

// --------------------------------------------------------------------
// Session-export fulfillment — mirrors the existing /api/export/webhook
// PayPal flow exactly: fetch blob, render PDF, email it, delete blob.
// --------------------------------------------------------------------
async function handleSessionExport(
  _session: Stripe.Checkout.Session,
  stripeSessionId: string,
  blobKey: string,
  tool: "reset" | "belief_inquiry" | "integration",
): Promise<NextResponse> {
  let payload: SessionPayload
  try {
    const blobMeta = await head(blobKey)
    const res = await fetch(blobMeta.url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`blob fetch ${res.status}`)
    payload = (await res.json()) as SessionPayload
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("not found") || msg.includes("BlobNotFound") || msg.includes("404")) {
      // Already-processed (blob deleted by previous successful run). Idempotent.
      return NextResponse.json({ ok: true, idempotent: true })
    }
    await alertAdmin({
      severity: "critical",
      subject: "Stripe export webhook: blob fetch failed — paid customer cannot get PDF",
      body:
        "Failed to fetch the session payload from Vercel Blob after a successful Stripe " +
        "capture. Customer paid but the source data for their PDF is unreachable. Manual " +
        "reconciliation required.",
      details: { stripeSessionId, blobKey, tool, errorMessage: msg },
      dedupKey: `stripe-export:blob-fetch-failed:${blobKey}`,
    })
    return NextResponse.json({ error: "Session data not available" }, { status: 500 })
  }

  if (payload.tool !== tool) {
    await alertAdmin({
      severity: "warning",
      subject: "Stripe export webhook: tool mismatch between metadata and blob",
      body: "The tool from Stripe's metadata does not match the tool field in the stored blob.",
      details: { metadataTool: tool, blobTool: payload.tool, blobKey, stripeSessionId },
      dedupKey: "stripe-export:tool-mismatch",
    })
  }

  try {
    await renderAndEmailSessionPdf(payload)
  } catch (err) {
    await alertAdmin({
      severity: "critical",
      subject: "Stripe export webhook: PDF render/email FAILED — paid customer didn't get their PDF",
      body:
        "renderAndEmailSessionPdf threw after a successful Stripe capture. Customer paid for " +
        "the session PDF but it was NOT delivered. Manual fulfillment required.",
      // PII (customer email) deliberately omitted — present in blob if needed for manual fulfillment.
      details: { stripeSessionId, blobKey, tool, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: `stripe-export:pdf-deliver-failed:${blobKey}`,
    })
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 })
  }

  try {
    await del(blobKey)
  } catch (err) {
    await alertAdmin({
      severity: "warning",
      subject: "Stripe export webhook: blob cleanup failed (non-fatal)",
      body: "Customer got their PDF but the source blob couldn't be deleted.",
      details: { stripeSessionId, blobKey, errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "stripe-export:blob-cleanup-failed",
    })
  }

  // Suppress unused-var warning on _session — keep the param for future
  // extension (we may want to log buyer email or amount for analytics later).
  void getStripe

  return NextResponse.json({ ok: true })
}
