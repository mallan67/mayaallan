// Build-cache buster: 2026-05-20 cross-env verification-failure fix.
// Turbopack file-hash change forces this route's chunk to recompile.
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { Resend } from "resend"
import { alertAdmin } from "@/lib/alert-admin"
import { apiBase, extractWebhookHeaders, getAccessToken, safePaypalEnvLabel, verifyPaypalWebhook } from "@/lib/paypal"
import { siteUrl } from "@/lib/site-url"
import { trackMarketingEvent } from "@/lib/marketing-events"
import { sanitizeResendError } from "@/lib/safe-log"
import crypto from "crypto"

// Explicit Node runtime + 60s budget. The default Vercel timeout (10-15s) can
// kill this function mid-fulfillment — signature verify + OAuth + optional
// order-fetch fallback + Supabase pre-check + order INSERT + claim RPC +
// Resend send + email-sent UPDATE + analytics writes can collectively burn
// well past 10s on a slow day. A killed function silently retries via
// PayPal, risking duplicate fulfillment if the kill landed after side-effects.
export const runtime = "nodejs"
export const maxDuration = 60

/**
 * PAYPAL WEBHOOK - Payment completion handler
 *
 * When a PayPal payment succeeds:
 * 1. Verify webhook signature (CRITICAL for security)
 * 2. Create Order record (idempotent by paypal_order_id)
 * 3. Generate secure DownloadToken (expires in 30 days, 5 max downloads)
 * 4. Send email with download link, then mark email_sent_at
 *
 * Required env vars:
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET (or legacy PAYPAL_SECRET — both names accepted)
 * - PAYPAL_WEBHOOK_ID (from PayPal Dashboard > Webhooks)
 * - PAYPAL_ENV          "sandbox" | "live"  (preferred)
 * - PAYPAL_API_BASE     (legacy fallback)
 *
 * Signature verification + OAuth token fetching are delegated to the
 * shared helper in src/lib/paypal.ts so this route and /api/export/webhook
 * stay on the same env conventions.
 */

/**
 * Send purchase confirmation email with download link via Resend.
 * Returns { ok: true } or { ok: false, error: string } — never throws.
 */
async function sendPurchaseEmail(args: {
  customerEmail: string
  customerName: string | null
  bookTitle: string
  downloadUrl: string
  expiresAt: Date
  maxDownloads: number
  /**
   * Resend idempotency key. PayPal retries webhooks up to 25× over 3
   * days on any non-2xx — without an idempotency key, the same purchase
   * email could be sent multiple times if upstream code path hits an
   * intermittent failure between Resend success and email_sent_at UPDATE.
   * Resend dedupes for 24h based on this key.
   */
  idempotencyKey: string
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }

  const resend = new Resend(resendKey)
  const greeting = args.customerName ? `Hi ${args.customerName.split(" ")[0]}` : "Hi"
  const expiryStr = args.expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const escape = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!))

  // 15s cap on the Resend call. If Resend hangs longer than this, we abort,
  // return ok:false, and the claim is released so a future PayPal retry can
  // re-attempt. Without the cap, a hung Resend can outlive the 10-minute
  // claim stale window — the next retry would re-acquire the claim and
  // potentially double-send if the first call eventually delivered.
  try {
    const sendPromise = resend.emails.send(
      {
        from: "Maya Allan <maya@mayaallan.com>",
        // Replies route to hello@ (operations inbox) so a customer reply
        // doesn't sit unread in a personal mailbox. Override per deployment
        // via SUPPORT_REPLY_TO if the operations inbox name changes.
        replyTo: process.env.SUPPORT_REPLY_TO || "hello@mayaallan.com",
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
      },
      { idempotencyKey: args.idempotencyKey },
    )

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Resend send timed out after 15s")), 15_000)
    )
    const { data, error } = await Promise.race([sendPromise, timeoutPromise])
    if (error) {
      return { ok: false, error: error.message ?? String(error) }
    }
    return { ok: true, id: data?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}

/**
 * M8: Strictly parse a PayPal custom_id into a positive-integer book id.
 *
 * Loose parseInt is dangerous here: parseInt("12abc", 10) === 12 would
 * silently fulfill the WRONG book, and parseInt("", 10) / parseInt("x", 10)
 * yield NaN. We accept ONLY a clean radix-10 string of digits that parses to
 * an integer > 0. Anything else returns null and funnels into the existing
 * "no-book-id" alert + 200 path (so PayPal stops retrying an unfulfillable
 * event instead of retry-storming).
 */
function parseBookId(raw: unknown): number | null {
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  if (!/^[0-9]+$/.test(trimmed)) return null
  const n = parseInt(trimmed, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function POST(request: Request) {
  const bodyText = await request.text()
  const headersList = await headers()

  // -----------------------------------------------------------------
  // Three-tier classification BEFORE we even attempt verification:
  //   (a) No PayPal-shaped headers → bot probe. Silent 401, no alert.
  //   (b) PayPal-shaped headers + verify SUCCESS → process event.
  //   (c) PayPal-shaped headers + verify FAILURE → real event with
  //       genuine signature mismatch. Alert as critical — this is the
  //       webhook-id-vs-env-var-mismatch case.
  // The bot-probe filter (a) kills 95%+ of false-positive alerts that
  // were firing every time the endpoint got scanned.
  // -----------------------------------------------------------------
  const transmissionId = headersList.get("paypal-transmission-id")
  const transmissionSig = headersList.get("paypal-transmission-sig")
  const certUrl = headersList.get("paypal-cert-url")
  const hasPaypalShape = !!(transmissionId && transmissionSig && certUrl)

  if (!hasPaypalShape) {
    // Bot probe — silent 401, NO alert. Just a log line for triage.
    console.log("[paypal-webhook] bot probe (no paypal headers)")
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  // Verify webhook signature via the shared helper.
  let isVerified = false
  try {
    isVerified = await verifyPaypalWebhook(extractWebhookHeaders({ headers: headersList }), bodyText)
  } catch (verifyErr) {
    console.error("verifyPaypalWebhook threw:", verifyErr)
  }
  if (!isVerified) {
    console.error("PayPal webhook verification failed (real-shaped request)")

    // Classify the failure by comparing the cert-URL host (which PayPal env
    // SIGNED the event) against our configured PAYPAL_ENV (which env WE
    // think we're talking to). The two main flavors of "real-shaped but
    // didn't verify" have very different remediations:
    //
    //   • Cross-env (e.g. sandbox-signed event arriving at a live endpoint):
    //     a webhook subscription still exists in the OTHER PayPal app
    //     pointing at this URL. Verification CAN NEVER succeed (live and
    //     sandbox verify endpoints can't validate each other's signatures),
    //     so PayPal retrying the same event 25× over 3 days produces a
    //     dedup-busting flood. Action: delete the stale subscription in the
    //     other PayPal dashboard.
    //
    //   • Same-env: cert-URL host matches our env. The PAYPAL_WEBHOOK_ID env
    //     var doesn't match the subscription PayPal signed with. Action: fix
    //     the env var to match the webhook ID shown in the PayPal dashboard.
    //
    // Either way: return 200, not 401. 401 (and any non-2xx) makes PayPal
    // retry the same unverifiable event up to 25× over 3 days, and every
    // retry that lands on a cold-started Vercel instance gets past the
    // in-memory alertAdmin dedup → email flood. 200 stops the retry storm;
    // the alert (with a 24h env-pair-scoped dedup key) is the actionable
    // surface for the operator.
    let certHost: string | null = null
    try {
      certHost = certUrl ? new URL(certUrl).host : null
    } catch {
      certHost = null
    }
    const signedByEnv: "live" | "sandbox" | "unknown" = certHost
      ? certHost.endsWith("sandbox.paypal.com")
        ? "sandbox"
        : certHost.endsWith("paypal.com")
        ? "live"
        : "unknown"
      : "unknown"
    const ourEnv = safePaypalEnvLabel()
    const isCrossEnv =
      (signedByEnv === "sandbox" && ourEnv === "live") ||
      (signedByEnv === "live" && ourEnv === "sandbox")

    if (isCrossEnv) {
      await alertAdmin({
        severity: "warning",
        subject: `PayPal webhook: cross-env delivery (${signedByEnv} → ${ourEnv})`,
        body:
          `A PayPal webhook signed by ${signedByEnv.toUpperCase()} arrived at this ` +
          `${ourEnv.toUpperCase()} endpoint. Verification cannot succeed across PayPal ` +
          `environments. Most likely the ${signedByEnv} PayPal app still has an active ` +
          `webhook subscription pointed at this URL — log into PayPal Developer → ` +
          `${signedByEnv === "sandbox" ? "Sandbox" : "Live"} → your app → Webhooks and ` +
          `delete the subscription. Returning 200 to stop PayPal's retry storm; the ` +
          `underlying ${signedByEnv} capture/order isn't ours to fulfill from ${ourEnv}.`,
        details: {
          ourEnv,
          signedByEnv,
          certUrlHost: certHost,
          transmissionIdPrefix: transmissionId?.slice(0, 12) ?? null,
        },
        dedupKey: `paypal:cross-env:${signedByEnv}-to-${ourEnv}`,
        // 7-day dedup. Cross-env is the transient state where a deleted
        // subscription's queued retries are draining out of PayPal's queue
        // (max 3 days). One alert per direction per week is more than
        // enough — the operator can't do anything new each time it fires.
        dedupWindowMs: 7 * 24 * 60 * 60 * 1000,
      })
      return NextResponse.json({ received: true, ignored: "cross-env-webhook" })
    }

    // Same-env (or unknown cert host) — genuine config mismatch or tampering.
    await alertAdmin({
      severity: "critical",
      subject: "PayPal webhook signature verification failed (real-shaped)",
      body:
        "A real-shaped PayPal webhook (with valid paypal-* headers) failed signature " +
        "verification, and the cert URL host matches our configured PAYPAL_ENV — so this " +
        "isn't a cross-environment leak. The PAYPAL_WEBHOOK_ID env var almost certainly " +
        "does not match the webhook subscription ID PayPal used to sign this event. " +
        `Verify the value of PAYPAL_WEBHOOK_ID against the webhook IDs listed in PayPal ` +
        `Developer → ${ourEnv === "live" ? "Live" : "Sandbox"} → your app → Webhooks. ` +
        "Returning 200 to stop PayPal's retry storm; until the env var is fixed, every " +
        "subsequent event will fail the same way.",
      details: {
        ourEnv,
        certUrlHost: certHost,
        transmissionIdPrefix: transmissionId?.slice(0, 12) ?? null,
      },
      dedupKey: `paypal:signature-failure:${ourEnv}`,
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
    return NextResponse.json({ received: true, ignored: "verification-failed" })
  }

  try {
    const body = JSON.parse(bodyText)

    // Handle both legacy (PAYMENT.SALE.COMPLETED) and modern (PAYMENT.CAPTURE.COMPLETED) events
    const isPaymentComplete =
      body.event_type === "PAYMENT.SALE.COMPLETED" ||
      body.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      body.event_type === "CHECKOUT.ORDER.COMPLETED"

    if (isPaymentComplete) {
      const resource = body.resource
      console.log("PayPal webhook event:", body.event_type)

      // Silently skip session-export events. PayPal delivers each capture
      // event to every webhook subscription on the app, so session-PDF
      // captures (custom_id = `blobKey|tool`) arrive at this URL too.
      // Without this short-circuit they fall through to "No book ID in
      // payment data" which 400s, causing PayPal to retry up to 25× and
      // firing repeated CRITICAL admin alerts. Pipe-separated ids belong
      // to /api/export/webhook.
      const rawCustomId: string | null =
        body.event_type === "PAYMENT.CAPTURE.COMPLETED"
          ? resource?.custom_id ?? null
          : body.event_type === "CHECKOUT.ORDER.COMPLETED"
          ? resource?.purchase_units?.[0]?.custom_id ?? null
          : resource?.custom ?? null
      if (typeof rawCustomId === "string" && rawCustomId.includes("|")) {
        return NextResponse.json({ received: true, ignored: "session-export" })
      }

      // Extract book ID from custom_id (modern) or custom (legacy)
      let bookId: number | null = null
      let customerEmail: string | null = null
      let customerName: string | null = null
      let paypalOrderId: string | null = null
      let amount: number = 0
      let currency: string = "usd"

      if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        // Modern checkout flow - capture completed
        bookId = parseBookId(resource.custom_id) // M8: strict positive-int parse
        // CRITICAL: for PAYMENT.CAPTURE.COMPLETED, resource.id is the CAPTURE id,
        // not the order id. Using it as paypal_order_id would create a different
        // dedup key than a CHECKOUT.ORDER.COMPLETED event for the same purchase,
        // breaking idempotency across both webhook subscriptions. The canonical
        // order id lives in supplementary_data.related_ids.order_id.
        paypalOrderId = resource.supplementary_data?.related_ids?.order_id ?? null
        if (!paypalOrderId) {
          // Missing related_ids.order_id on a modern PAYMENT.CAPTURE.COMPLETED
          // is anomalous — PayPal v2 should always include it. Ignore the
          // event rather than fall back to capture.id (which would create a
          // duplicate fulfillment path) and alert so we can investigate.
          await alertAdmin({
            severity: "critical",
            subject: "PayPal webhook: PAYMENT.CAPTURE.COMPLETED missing related_ids.order_id",
            body:
              "A PAYMENT.CAPTURE.COMPLETED event arrived with no " +
              "supplementary_data.related_ids.order_id. We refuse to use resource.id " +
              "(which is the capture id, not the order id) because that would create a " +
              "different dedup key than a CHECKOUT.ORDER.COMPLETED for the same purchase " +
              "and risk double-fulfillment. Investigate the PayPal payload and reconcile " +
              "manually.",
            details: { captureId: resource.id, eventType: body.event_type },
            dedupKey: "paypal:capture-missing-order-id",
          })
          return NextResponse.json({ received: true, ignored: "missing-order-id" })
        }
        amount = parseFloat(resource.amount?.value || "0")
        currency = resource.amount?.currency_code?.toLowerCase() || "usd"
        // Note: payer info may be in supplementary_data for captures
        customerEmail = resource.payer?.email_address || resource.supplementary_data?.payer?.email_address
        customerName = resource.payer?.name?.given_name
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname || ""}`.trim()
          : null
      } else if (body.event_type === "CHECKOUT.ORDER.COMPLETED") {
        // Checkout order completed
        const purchaseUnit = resource.purchase_units?.[0]
        bookId = parseBookId(purchaseUnit?.custom_id) // M8: strict positive-int parse
        paypalOrderId = resource.id
        amount = parseFloat(purchaseUnit?.amount?.value || "0")
        currency = purchaseUnit?.amount?.currency_code?.toLowerCase() || "usd"
        customerEmail = resource.payer?.email_address
        customerName = resource.payer?.name?.given_name
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname || ""}`.trim()
          : null
      } else {
        // Legacy PAYMENT.SALE.COMPLETED
        bookId = parseBookId(resource.custom) // M8: strict positive-int parse
        paypalOrderId = resource.id
        amount = parseFloat(resource.amount?.total || "0")
        currency = resource.amount?.currency?.toLowerCase() || "usd"
        customerEmail = resource.payer?.email_address
        customerName = resource.payer?.name?.given_name && resource.payer?.name?.surname
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`
          : null
      }

      // Unified order-fetch fallback. ALL three event-type branches can land
      // here with customerEmail still null: PAYMENT.CAPTURE.COMPLETED notoriously
      // omits payer info, and legacy SALE.COMPLETED / CHECKOUT.ORDER.COMPLETED
      // can also omit it on certain capture methods. A single GET on the order
      // always includes the payer block. AbortSignal.timeout caps the extra
      // call so the webhook can't hang.
      if (!customerEmail && paypalOrderId) {
        try {
          const orderToken = await getAccessToken()
          const orderRes = await fetch(
            `${apiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
            {
              headers: { Authorization: `Bearer ${orderToken}` },
              signal: AbortSignal.timeout(10_000),
            },
          )
          if (orderRes.ok) {
            const orderData = await orderRes.json()
            customerEmail = orderData?.payer?.email_address ?? customerEmail
            if (!customerName && orderData?.payer?.name?.given_name) {
              customerName = `${orderData.payer.name.given_name} ${orderData.payer.name.surname || ""}`.trim()
            }
          } else {
            console.warn(`[paypal webhook] order fetch returned ${orderRes.status} for ${paypalOrderId}`)
          }
        } catch (fetchErr) {
          console.error("[paypal webhook] order fetch failed:", fetchErr)
        }
      }

      if (!bookId) {
        // Returning 4xx here makes PayPal retry up to 25× over 3 days, which
        // floods admin alerts on every retry of an unfulfillable event (e.g.
        // someone's stray test order with no custom_id). Return 200 + ignored
        // so PayPal stops retrying, and alert ONCE so manual reconciliation
        // can happen if the event is genuinely ours.
        await alertAdmin({
          severity: "critical",
          subject: "PayPal: webhook missing book ID — cannot fulfill",
          body:
            "A payment event arrived without a parseable book ID in custom_id. " +
            "PayPal has captured money on their side but we have no idea which book " +
            "to deliver. Manual reconciliation required from the PayPal dashboard.",
          details: { eventType: body.event_type, paypalOrderId },
          dedupKey: `paypal:no-book-id:${paypalOrderId ?? "unknown"}`,
        })
        return NextResponse.json({ received: true, ignored: "no-book-id" })
      }

      // Get book from database
      const { data: book, error: bookError } = await supabaseAdmin
        .from(Tables.books)
        .select("*")
        .eq("id", bookId)
        .single()

      if (bookError || !book) {
        // Same reasoning: 200 + alert instead of 404, so PayPal stops retrying.
        await alertAdmin({
          severity: "critical",
          subject: "PayPal: webhook references unknown book ID",
          body:
            "A payment event arrived referencing a book ID that doesn't exist in the database. " +
            "Either the book was deleted between order creation and fulfillment, or custom_id " +
            "was tampered with. Manual reconciliation required.",
          details: { bookId, paypalOrderId, errorCode: bookError?.code },
          dedupKey: `paypal:book-not-found:${bookId}`,
        })
        return NextResponse.json({ received: true, ignored: "book-not-found" })
      }

      if (!customerEmail) {
        // Same reasoning as !bookId above. After the unified order-fetch
        // fallback, missing email means PayPal genuinely doesn't have a payer
        // we can reach — alert critically, 200 so no retry storm.
        await alertAdmin({
          severity: "critical",
          subject: "PayPal: webhook missing customer email — cannot deliver",
          body:
            "A payment captured but we have no email to send the download link to. " +
            "Order-fetch fallback also returned no payer. Manual reconciliation required: " +
            "find the order in PayPal, look up the buyer's email, send the link manually.",
          details: { paypalOrderId, bookId: book.id },
          dedupKey: `paypal:no-email:${paypalOrderId}`,
        })
        return NextResponse.json({ received: true, ignored: "no-customer-email" })
      }

      // ----------------------------------------------------------------
      // CURRENCY guard (hard block). `currency` (lowercased) was parsed above
      // from the capture resource's amount.currency_code.
      //
      // Why no AMOUNT-vs-price check here: PayPal enforces that a capture equals
      // the amount on the order, and our checkout route creates orders
      // server-side under our merchant account (the client cannot set the
      // price), so the captured value is always exactly what we charged.
      // Comparing to the CURRENT ebook_price would only false-positive on a
      // legit mid-flight price edit (stranding a paying buyer), and a real
      // underpayment would require an attacker to create a cheap order under our
      // account (which needs our PayPal credentials). Proper defense-in-depth —
      // comparing against the amount recorded at order-creation time — needs an
      // expected_amount column and is tracked as a follow-up. Currency, however,
      // is unambiguous: this is a USD-only store, so a non-USD capture is a
      // genuine anomaly (forged / manual order) and we hard-block it.
      // ----------------------------------------------------------------
      if (currency.toUpperCase() !== "USD") {
        await alertAdmin({
          severity: "critical",
          subject: "PayPal: captured currency is not USD — NOT fulfilling",
          body:
            "A signature-verified PayPal capture used a non-USD currency for a USD-only store. " +
            "Refusing to fulfill (no token, no email). Returning 200 so PayPal stops retrying; " +
            "reconcile manually — this can indicate a forged / manual order.",
          details: {
            paypalOrderId,
            bookId: book.id,
            expectedCurrency: "USD",
            actualAmount: amount,
            actualCurrency: currency,
          },
          dedupKey: `paypal:currency-mismatch:${paypalOrderId}`,
        })
        return NextResponse.json({ received: true, ignored: "currency-mismatch" })
      }

      // ----------------------------------------------------------------
      // IDEMPOTENCY — pre-check for an existing order with this paypal_order_id.
      // PayPal retries webhooks up to 25× over 3 days on any 5xx or slow ACK,
      // so the SAME webhook payload arriving twice is a normal-operations event,
      // not an edge case. Without this guard the customer gets two emails and
      // two download tokens for one purchase.
      //
      // Three paths fall out of the pre-check:
      //   1. No existing order → INSERT (backstopped by uq_orders_paypal_order_id)
      //   2. Order exists AND token exists → fully fulfilled; dedup and return
      //   3. Order exists but NO token → previous webhook crashed mid-flight;
      //      resume fulfillment using the existing order row
      // ----------------------------------------------------------------
      let order: any
      let resumingExistingOrder = false

      const { data: existingOrder } = await supabaseAdmin
        .from(Tables.orders)
        .select("*")
        .eq("paypal_order_id", paypalOrderId)
        .maybeSingle()

      // The token we'll email the customer. If a previous attempt already
      // created a token row but failed before email send, we reuse it
      // (don't mint a second token).
      let reusableToken: { id: number; token: string; expires_at: string; max_downloads: number | null; email_sent_at: string | null } | null = null

      if (existingOrder) {
        const { data: existingToken } = await supabaseAdmin
          .from(Tables.downloadTokens)
          .select("id, token, expires_at, max_downloads, email_sent_at")
          .eq("order_id", existingOrder.id)
          .maybeSingle()

        if (existingToken && existingToken.email_sent_at) {
          // Identical retry of a fully fulfilled order — token exists AND
          // the email was confirmed sent. Don't re-mint, don't re-email,
          // just 200 PayPal so they stop retrying.
          return NextResponse.json({
            received: true,
            deduplicated: true,
            orderId: existingOrder.id,
          })
        }

        if (existingToken) {
          // Token exists but email_sent_at IS NULL — the previous attempt
          // failed AFTER token INSERT, BEFORE Resend confirmed delivery.
          // Reuse the existing token and resume email delivery instead of
          // returning deduplicated:true (which would silently strand the
          // customer with no email).
          reusableToken = existingToken
        }

        // Order row exists — resume from where the previous attempt failed.
        // Don't insert a duplicate order row.
        resumingExistingOrder = true
        order = existingOrder
      } else {
        const { data: insertedOrder, error: orderError } = await supabaseAdmin
          .from(Tables.orders)
          .insert({
            // Legacy NOT NULL columns (from the original schema). The
            // newer columns below (`email`, `amount`) are what we read elsewhere,
            // but the legacy ones still carry NOT NULL constraints and must be
            // populated or the INSERT fails. Keep both in sync.
            customer_email: customerEmail,
            amount_cents: Math.round(amount * 100),
            // Newer canonical columns the rest of the app reads from.
            email: customerEmail,
            customer_name: customerName || null,
            paypal_order_id: paypalOrderId,
            book_id: book.id,
            format_type: "ebook", // Direct sales are ebook-only — see /api/checkout/paypal
            amount: amount,
            currency: currency,
            payment_provider: "paypal",
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (orderError || !insertedOrder) {
          // 23505 = postgres unique_violation. A concurrent webhook attempt
          // just inserted the same paypal_order_id between our pre-check and
          // our INSERT. Re-select; then verify the winning attempt also got
          // the email out. If not, resume email delivery using the winner's
          // token row instead of blindly returning deduplicated.
          if (orderError?.code === "23505") {
            const { data: racedOrder } = await supabaseAdmin
              .from(Tables.orders)
              .select("*")
              .eq("paypal_order_id", paypalOrderId)
              .maybeSingle()
            if (racedOrder) {
              const { data: racedToken } = await supabaseAdmin
                .from(Tables.downloadTokens)
                .select("id, token, expires_at, max_downloads, email_sent_at")
                .eq("order_id", racedOrder.id)
                .maybeSingle()

              if (racedToken && racedToken.email_sent_at) {
                // Winner did it all — safe to dedupe.
                return NextResponse.json({
                  received: true,
                  deduplicated: true,
                  raced: true,
                  orderId: racedOrder.id,
                })
              }

              if (racedToken) {
                // Winner created the token but never sent the email — resume.
                reusableToken = racedToken
              }
              // Either way, continue with the raced order row + (maybe) the
              // raced token; don't return early.
              resumingExistingOrder = true
              order = racedOrder
              // Skip the alertAdmin + 500 below because we recovered.
            }
          }

          if (!order) {
            console.error("Failed to create order:", orderError)
            // CRITICAL — customer money captured by PayPal, but we have no order row.
            await alertAdmin({
              severity: "critical",
              subject: "PayPal: payment received but order INSERT failed",
              body:
                `A PayPal payment came in but writing the order row to Supabase failed. ` +
                `PayPal will retry the webhook automatically; if retries don't succeed, ` +
                `the payment is in PayPal with no order record on our side. Reconcile manually.`,
              details: {
                paypalOrderId,
                bookId,
                amount,
                currency,
                errorCode: orderError?.code,
              },
              dedupKey: `paypal:order-insert-failed:${paypalOrderId}`,
            })
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
          }
          // Else: we recovered via the 23505 race-recovery block above.
        } else {
          order = insertedOrder
        }
      }

      if (resumingExistingOrder) {
        // Worth a warning-level alert — this means an earlier webhook attempt
        // crashed somewhere between order INSERT and token creation. Once is
        // forgivable; if it recurs, something is wrong with token creation
        // or email delivery.
        await alertAdmin({
          severity: "warning",
          subject: "PayPal webhook: resuming previously-failed fulfillment",
          body:
            "An order row already existed for this PayPal order but no download " +
            "token was created — the previous webhook attempt crashed mid-flight. " +
            "Resuming token creation + email delivery now.",
          details: { orderId: order.id, paypalOrderId },
          dedupKey: `paypal:resume-fulfillment:${paypalOrderId}`,
        })
      }

      // Generate download token if ebook file exists
      if (book.ebook_file_url) {
        // Token row to use for emailing. May be (a) a freshly inserted row,
        // (b) the reusableToken we discovered earlier (existing-order branch
        // or race recovery), or (c) the existing row a concurrent webhook
        // just inserted while we were racing — we hit 23505 here and re-select.
        let tokenRowId: number
        let tokenValue: string
        let tokenExpiresAt: Date
        let tokenMaxDownloads: number
        let tokenAlreadyEmailed = false

        if (reusableToken) {
          // Path: existing-order branch already found a token row with
          // email_sent_at IS NULL. Use it directly.
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
              // Per-deployment override via DOWNLOAD_TOKEN_MAX_DOWNLOADS;
              // defaults to 5. Audiobooks or larger packages may want a
              // lower or higher cap once that flow is built.
              max_downloads: Number(process.env.DOWNLOAD_TOKEN_MAX_DOWNLOADS) || 5,
              expires_at: newExpiresAt.toISOString(),
            })
            .select("id, token, expires_at, max_downloads, email_sent_at")
            .single()

          if (tokenError && tokenError.code === "23505") {
            // A concurrent webhook just won the token-insert race. Re-select
            // and continue with the winner's token. If the winner already
            // sent the email, dedupe; otherwise resume email delivery.
            const { data: racedToken } = await supabaseAdmin
              .from(Tables.downloadTokens)
              .select("id, token, expires_at, max_downloads, email_sent_at")
              .eq("order_id", order.id)
              .maybeSingle()

            if (!racedToken) {
              // Shouldn't happen — the unique index fired but the row is gone.
              await alertAdmin({
                severity: "critical",
                subject: "PayPal webhook: token 23505 but no row on re-select",
                body:
                  "download_tokens INSERT raised unique_violation but the matching " +
                  "row could not be re-selected. Either the index is misconfigured or " +
                  "the winner's transaction rolled back after raising the conflict.",
                details: { orderId: order.id, paypalOrderId },
                dedupKey: `paypal:token-23505-no-row:${paypalOrderId}`,
              })
              return NextResponse.json({
                error: "Order completed but token state is inconsistent — manual fulfillment required.",
                orderId: order.id,
              }, { status: 500 })
            }

            if (racedToken.email_sent_at) {
              // Winner emailed. Done.
              return NextResponse.json({
                received: true,
                deduplicated: true,
                raced: true,
                orderId: order.id,
              })
            }

            tokenRowId = racedToken.id
            tokenValue = racedToken.token
            tokenExpiresAt = new Date(racedToken.expires_at)
            tokenMaxDownloads = racedToken.max_downloads ?? 5
          } else if (tokenError || !downloadToken) {
            console.error("Token creation failed for order", order.id, "-", tokenError)
            await alertAdmin({
              severity: "critical",
              subject: "PayPal order completed but token creation FAILED",
              body: `A customer paid but download-token creation failed. Manual fulfillment required.`,
              details: { orderId: order.id, paypalOrderId, bookId: book.id, errorCode: tokenError?.code },
              dedupKey: `paypal:token-insert-failed:${paypalOrderId}`,
            })
            return NextResponse.json({
              error: "Order completed but download token creation failed. Manual fulfillment required.",
              orderId: order.id,
            }, { status: 500 })
          } else {
            tokenRowId = downloadToken.id
            tokenValue = downloadToken.token
            tokenExpiresAt = new Date(downloadToken.expires_at)
            tokenMaxDownloads = downloadToken.max_downloads ?? 5
            tokenAlreadyEmailed = !!downloadToken.email_sent_at
          }
        }

        // Defense-in-depth: if the token row already has email_sent_at, we
        // shouldn't reach here, but if we somehow do, skip the resend.
        if (tokenAlreadyEmailed) {
          return NextResponse.json({
            received: true,
            deduplicated: true,
            orderId: order.id,
          })
        }

        // ----------------------------------------------------------------
        // ATOMIC EMAIL-SEND CLAIM
        //
        // Multiple concurrent webhook workers may all reach this point with
        // email_sent_at still NULL. Without an atomic claim, they would all
        // call Resend and the customer would get one email per worker.
        //
        // The claim RPC takes a row lock, checks both email_sent_at and
        // email_send_claimed_at, and either grants the claim ('ok') or
        // refuses ('claimed_by_other' / 'already_sent'). Only the worker
        // that gets 'ok' calls Resend.
        // ----------------------------------------------------------------
        const workerId = `vercel:${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}:${crypto.randomBytes(8).toString("hex")}`

        const { data: claimRows, error: claimError } = await supabaseAdmin.rpc(
          "claim_download_email_send",
          { p_token: tokenValue, p_worker_id: workerId, p_stale_timeout_seconds: 600 },
        )

        if (claimError) {
          await alertAdmin({
            severity: "critical",
            subject: "PayPal webhook: email-send claim RPC failed",
            body:
              "claim_download_email_send errored. Cannot safely send the delivery email without " +
              "the claim — risk of duplicate emails under concurrent retries. Returning 500 so " +
              "PayPal retries.",
            details: { orderId: order.id, errorCode: claimError.code, errorMessage: claimError.message },
            dedupKey: "paypal:claim-rpc-failed",
          })
          return NextResponse.json({
            error: "Service temporarily unavailable. PayPal will retry.",
            orderId: order.id,
          }, { status: 500 })
        }

        const claimResult = Array.isArray(claimRows) ? claimRows[0] : claimRows

        if (!claimResult || claimResult.status === "not_found") {
          // Token row vanished between the SELECT we did earlier and the claim.
          // Anomalous — alert and fail so PayPal retries.
          await alertAdmin({
            severity: "critical",
            subject: "PayPal webhook: token row vanished before email claim",
            body: "Claim RPC reports no row for the token we just inserted/looked up. Investigate.",
            details: { orderId: order.id, tokenRowId },
            dedupKey: "paypal:claim-no-row",
          })
          return NextResponse.json({
            error: "Service temporarily unavailable. PayPal will retry.",
            orderId: order.id,
          }, { status: 500 })
        }

        if (claimResult.status === "already_sent") {
          // Some other path already marked email_sent_at — dedupe cleanly.
          return NextResponse.json({
            received: true,
            deduplicated: true,
            orderId: order.id,
          })
        }

        if (claimResult.status === "claimed_by_other") {
          // Another concurrent worker holds a fresh claim and is sending now.
          // Return 500 so PayPal retries; by the time it retries, the
          // claimant will have either set email_sent_at (next attempt
          // dedupes) or released the claim (next attempt resends).
          // Don't alert — this is normal under concurrent retries.
          return NextResponse.json({
            error: "Concurrent fulfillment in progress. PayPal will retry.",
            orderId: order.id,
          }, { status: 500 })
        }

        // claimResult.status === "ok" — we are the sole worker authorized
        // to send the email for this token. NEVER log the token value.
        const downloadUrl = `${siteUrl()}/download/${tokenValue}`

        const emailResult = await sendPurchaseEmail({
          customerEmail,
          customerName,
          bookTitle: book.title,
          downloadUrl,
          expiresAt: tokenExpiresAt,
          maxDownloads: tokenMaxDownloads,
          // Keyed on the PayPal order id so any number of PayPal retries
          // can only deliver one purchase email per actual purchase. The
          // atomic claim above already prevents double-send within our
          // own DB; the idempotency key is defense-in-depth at Resend.
          idempotencyKey: `paypal-book-purchase-${paypalOrderId}`,
        })

        if (!emailResult.ok) {
          // Release the claim so a future retry can re-acquire it. If the
          // release itself fails the claim will stale-timeout in 10 min.
          await supabaseAdmin.rpc("release_download_email_claim", {
            p_token: tokenValue,
            p_worker_id: workerId,
          })

          console.error("Purchase email failed for order", order.id, ":", emailResult.error)
          await alertAdmin({
            severity: "error",
            subject: "PayPal: order completed but delivery email failed",
            body:
              "Order + token are valid but Resend rejected the send. Claim released so the next " +
              "PayPal retry (or a manual resend) can try again. If Resend remains down, send the " +
              "link manually.",
            details: {
              orderId: order.id,
              paypalOrderId,
              bookId: book.id,
              // Sanitize Resend error to strip any echoed customer email
              // (Resend frequently echoes the recipient address verbatim
              // in error messages). PII rule from d01200b.
              resendError: sanitizeResendError(emailResult.error),
            },
            dedupKey: `paypal:email-failed:${paypalOrderId}`,
          })
          return NextResponse.json({
            error: "Order completed but delivery email failed. PayPal will retry.",
            orderId: order.id,
          }, { status: 500 })
        }

        // Email confirmed delivered by Resend — record it AND clear the claim
        // columns (they served their purpose; clearing keeps the row clean).
        const { error: sentUpdateError } = await supabaseAdmin
          .from(Tables.downloadTokens)
          .update({
            email_sent_at: new Date().toISOString(),
            email_send_claimed_at: null,
            email_send_claimed_by: null,
          })
          .eq("id", tokenRowId)

        if (sentUpdateError) {
          // Non-fatal — the customer already has their email. But a future
          // webhook retry will think the email wasn't sent and try to send
          // it again. The claim is still in place though, so the duplicate
          // attempt would see 'claimed_by_other' and (correctly) wait until
          // the claim staleness expires (10 min) before retrying. Net effect:
          // possible duplicate email after 10 min if PayPal keeps retrying.
          console.error("Failed to set email_sent_at:", sentUpdateError)
          await alertAdmin({
            severity: "warning",
            subject: "PayPal webhook: email delivered but email_sent_at update failed",
            body:
              "The download link email was successfully delivered, but the email_sent_at " +
              "column on download_tokens couldn't be updated. The claim is still held so " +
              "duplicate sends are blocked for 10 minutes; after that a PayPal retry could " +
              "send a duplicate email.",
            details: {
              orderId: order.id,
              tokenRowId,
              errorCode: sentUpdateError.code,
            },
            dedupKey: "paypal:email-sent-update-failed",
          })
        }

        // Track conversion. Webhooks don't carry the buyer's browser cookies
        // (PayPal posts server-to-server), so we look up the attribution
        // snapshot the checkout route persisted to pending_paypal_orders
        // (keyed on paypal_order_id) and use it for both the event row's
        // utm_* columns and the orders.* attribution columns.
        //
        // ALL analytics writes are wrapped in a 3s hard timeout. The email is
        // already sent + email_sent_at is set — analytics is best-effort only.
        // If Supabase is slow, we MUST NOT chew the function budget past the
        // 200 response, or PayPal will retry a fully-fulfilled order.
        try {
          const analyticsPromise = (async () => {
          type CheckoutAttribution = {
            visitor_id: string | null
            session_id: string | null
            utm_source: string | null
            utm_medium: string | null
            utm_campaign: string | null
            utm_content: string | null
            utm_term: string | null
            landing_page: string | null
            referrer: string | null
          }
          let attribution: CheckoutAttribution | null = null

          const { data: pendingRow } = await supabaseAdmin
            .from("pending_paypal_orders")
            .select(
              "visitor_id, session_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_page, referrer",
            )
            .eq("paypal_order_id", paypalOrderId)
            .maybeSingle()

          if (pendingRow) attribution = pendingRow as unknown as CheckoutAttribution

          // INSERT marketing_events with the attribution columns populated.
          // We hand-write the insert instead of using trackMarketingEvent
          // because that helper only reads from request cookies (which
          // don't exist on a server-to-server webhook).
          const { error: eventInsertError } = await supabaseAdmin
            .from("marketing_events")
            .insert({
              visitor_id: attribution?.visitor_id ?? null,
              session_id: attribution?.session_id ?? null,
              event_name: "purchase_completed",
              path: "/api/payment/paypal/webhook",
              referrer: attribution?.referrer ?? null,
              utm_source: attribution?.utm_source ?? null,
              utm_medium: attribution?.utm_medium ?? null,
              utm_campaign: attribution?.utm_campaign ?? null,
              utm_content: attribution?.utm_content ?? null,
              utm_term: attribution?.utm_term ?? null,
              properties: {
                order_id: order.id,
                paypal_order_id: paypalOrderId,
                amount: typeof amount === "number" ? amount : null,
                currency: typeof currency === "string" ? currency : null,
                book_id: typeof book?.id === "number" ? book.id : null,
                title: typeof book?.title === "string" ? book.title.slice(0, 128) : null,
                fulfillment_status: "completed",
              },
            })
          if (eventInsertError) {
            console.error(
              "[webhook] purchase_completed event insert failed:",
              eventInsertError.message,
              eventInsertError.code,
            )
          }

          // Also denormalize the attribution onto the orders row so the
          // admin dashboard / CSV exports / future joins don't need to
          // touch marketing_events for basic revenue-by-campaign.
          if (attribution) {
            const { error: orderUpdateError } = await supabaseAdmin
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
            if (orderUpdateError) {
              console.error(
                "[webhook] orders attribution update failed:",
                orderUpdateError.message,
                orderUpdateError.code,
              )
            }
          }
          })() // close analyticsPromise IIFE
          const analyticsTimeout = new Promise<void>((resolve) =>
            setTimeout(() => resolve(), 3_000)
          )
          await Promise.race([analyticsPromise, analyticsTimeout])
        } catch (trackErr) {
          console.error("[webhook] purchase tracking failed:", trackErr)
        }

        return NextResponse.json({
          success: true,
          orderId: order.id,
        })
      }

      // No ebook file — just confirm order
      console.warn("Order", order.id, "completed but book", book.id, "has no ebook_file_url — nothing to deliver")
      return NextResponse.json({
        success: true,
        orderId: order.id,
        warning: "No ebook file URL set for this book",
      })
    }

    // Refund / dispute / reversal events. We don't process them automatically
    // (no auto-refund-tracker today), but we MUST notify Maya — a customer
    // chargeback with no notification is a real operational gap. Coarse
    // dedup per event-type keeps probe spam from flooding the inbox while
    // still alerting on every distinct event_type seen in a 1h window.
    const eventType = typeof body.event_type === "string" ? body.event_type : null
    if (
      eventType === "PAYMENT.CAPTURE.REFUNDED" ||
      eventType === "PAYMENT.CAPTURE.REVERSED" ||
      eventType === "PAYMENT.SALE.REFUNDED" ||
      eventType === "PAYMENT.SALE.REVERSED" ||
      (eventType !== null && eventType.startsWith("CUSTOMER.DISPUTE."))
    ) {
      await alertAdmin({
        severity: "warning",
        subject: `PayPal: ${eventType}`,
        body:
          "A refund / reversal / dispute event was received from PayPal. We don't " +
          "process these automatically — review the transaction in the PayPal " +
          "Business dashboard and take action (respond to dispute, reconcile order " +
          "status, contact customer, etc) as needed.",
        details: { eventType, paypalOrderId: (body?.resource as any)?.id ?? null },
        dedupKey: `paypal:${eventType}`,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("PayPal webhook error:", error)
    // Top-level catch — code threw mid-flight after signature passed.
    // The payment may or may not be reflected as an order. Surface for review.
    await alertAdmin({
      severity: "critical",
      subject: "PayPal webhook handler threw an unexpected error",
      body:
        "The PayPal webhook handler threw after signature verification succeeded. " +
        "Customer money may have been captured; order/token may or may not exist. " +
        "Check Vercel function logs immediately and reconcile against PayPal.",
      details: { errorMessage: error?.message ?? String(error) },
      dedupKey: "paypal:handler-threw",
    })
    // Don't leak error.message back over the wire — log server-side only.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
