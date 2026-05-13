import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { Resend } from "resend"
import { alertAdmin } from "@/lib/alert-admin"
import { extractWebhookHeaders, verifyPaypalWebhook } from "@/lib/paypal"
import crypto from "crypto"

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
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }

  const resend = new Resend(resendKey)
  const greeting = args.customerName ? `Hi ${args.customerName.split(" ")[0]}` : "Hi"
  const expiryStr = args.expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const escape = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!))

  try {
    const { data, error } = await resend.emails.send({
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
    if (error) {
      return { ok: false, error: error.message ?? String(error) }
    }
    return { ok: true, id: data?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}

export async function POST(request: Request) {
  const bodyText = await request.text()
  const headersList = await headers()

  // Verify webhook signature via the shared helper. In dev where
  // PAYPAL_WEBHOOK_ID isn't set, verifyPaypalWebhook returns false on missing
  // headers / config — we still alert so a misconfigured prod gets flagged.
  let isVerified = false
  try {
    isVerified = await verifyPaypalWebhook(extractWebhookHeaders({ headers: headersList }), bodyText)
  } catch (verifyErr) {
    console.error("verifyPaypalWebhook threw:", verifyErr)
  }
  if (!isVerified) {
    console.error("PayPal webhook verification failed")
    // Dedup heavily — bots probe webhook endpoints constantly; we want one
    // alert per hour at most, not one per probe.
    await alertAdmin({
      severity: "critical",
      subject: "PayPal webhook signature verification failed",
      body:
        "An incoming PayPal webhook failed signature verification. Either an attacker is probing the endpoint, or PAYPAL_WEBHOOK_ID / PAYPAL_SECRET / PAYPAL_CLIENT_ID is misconfigured. " +
        "Check Vercel logs for the source IP and frequency.",
      dedupKey: "paypal:signature-failure",
    })
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
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

      // Extract book ID from custom_id (modern) or custom (legacy)
      let bookId: number | null = null
      let customerEmail: string | null = null
      let customerName: string | null = null
      let paypalOrderId: string | null = null
      let amount: number = 0
      let currency: string = "usd"

      if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        // Modern checkout flow - capture completed
        bookId = resource.custom_id ? parseInt(resource.custom_id) : null
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
        bookId = purchaseUnit?.custom_id ? parseInt(purchaseUnit.custom_id) : null
        paypalOrderId = resource.id
        amount = parseFloat(purchaseUnit?.amount?.value || "0")
        currency = purchaseUnit?.amount?.currency_code?.toLowerCase() || "usd"
        customerEmail = resource.payer?.email_address
        customerName = resource.payer?.name?.given_name
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname || ""}`.trim()
          : null
      } else {
        // Legacy PAYMENT.SALE.COMPLETED
        bookId = resource.custom ? parseInt(resource.custom) : null
        paypalOrderId = resource.id
        amount = parseFloat(resource.amount?.total || "0")
        currency = resource.amount?.currency?.toLowerCase() || "usd"
        customerEmail = resource.payer?.email_address
        customerName = resource.payer?.name?.given_name && resource.payer?.name?.surname
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`
          : null
      }

      if (!bookId) {
        console.error("No book ID in PayPal webhook:", body.event_type)
        return NextResponse.json({ error: "No book ID in payment data" }, { status: 400 })
      }

      // Get book from database
      const { data: book, error: bookError } = await supabaseAdmin
        .from(Tables.books)
        .select("*")
        .eq("id", bookId)
        .single()

      if (bookError || !book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }

      if (!customerEmail) {
        console.error("No customer email in PayPal webhook")
        return NextResponse.json({ error: "No customer email" }, { status: 400 })
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
            email: customerEmail,
            customer_name: customerName || null,
            paypal_order_id: paypalOrderId,
            book_id: book.id,
            format_type: "ebook", // Direct sales are ebook-only — see /api/checkout/paypal
            amount: amount,
            currency: currency,
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
                customerEmail,
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
          details: { orderId: order.id, paypalOrderId, customerEmail },
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
              max_downloads: 5,
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
              details: { orderId: order.id, customerEmail, bookTitle: book.title, errorCode: tokenError?.code },
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
        const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/download/${tokenValue}`

        const emailResult = await sendPurchaseEmail({
          customerEmail,
          customerName,
          bookTitle: book.title,
          downloadUrl,
          expiresAt: tokenExpiresAt,
          maxDownloads: tokenMaxDownloads,
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
              customerEmail,
              bookTitle: book.title,
              resendError: emailResult.error,
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
