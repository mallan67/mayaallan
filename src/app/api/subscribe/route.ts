import { NextResponse, after } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { runAfterResponse } from "@/lib/after-response"
import nodemailer from "nodemailer"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { alertAdmin } from "@/lib/alert-admin"
import { resolveOperatorRecipient } from "@/lib/operator-email"
import { trackMarketingEvent, emailDomainOnly } from "@/lib/marketing-events"
import { safeLogError, emailDomain, errorMessage } from "@/lib/safe-log"
import { syncSubscriberToResend } from "@/lib/resend-newsletter.mjs"

/**
 * Newsletter subscribe: stricter validation + honeypot + centralized recipient.
 *
 * Validation (PR D tightening):
 *   - email     trim, lowercase, valid email, max 254
 *   - company   honeypot. If present + non-empty, return success without
 *               storing or emailing.
 */
const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  company: z.string().optional(),
})

const HTML_ENTITIES: Record<string, string> = {
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;",
}
const escapeHtml = (s: string) => s.replace(/[<>&"']/g, (c) => HTML_ENTITIES[c]!)

// Create SMTP transporter for Porkbun
const transporter = process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: "smtp.porkbun.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

export async function POST(request: Request) {
  // FAIL-OPEN: an Upstash outage must not 500 a real newsletter signup.
  let limit: { allowed: boolean; retryAfterSeconds?: number }
  try {
    limit = await rateLimit({
      scope: "subscribe",
      ip: getClientIp(request),
      windowMs: 60 * 60 * 1000,
      maxAttempts: 10,
      lockoutMs: 60 * 60 * 1000,
    })
  } catch (rlErr) {
    console.error("[subscribe] rate-limit unavailable, allowing through:", rlErr)
    limit = { allowed: true }
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) } },
    )
  }

  try {
    const body = await request.json()
    const parsed = subscribeSchema.parse(body)
    const { email } = parsed

    // Honeypot — pretend success, don't write to DB, don't send email.
    if (parsed.company && parsed.company.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Subscribed successfully" })
    }

    // Use upsert to avoid duplicate email errors
    const { error } = await supabaseAdmin
      .from(Tables.emailSubscribers)
      .upsert(
        { email },
        { onConflict: "email", ignoreDuplicates: true }
      )

    if (error) {
      console.error("Supabase insert error:", error.message, error.code, error.details)
      throw error
    }

    // The subscriber row is now durable. From here on NOTHING noncritical is
    // awaited in the request path: the three follow-ups below (marketing
    // tracking, operator SMTP notification, Resend Segment sync) are each
    // registered as their OWN after() task via runAfterResponse(). Next
    // drains after() callbacks through an unbounded-concurrency queue once the
    // response closes, so they start together and a stall or failure in any
    // one cannot keep the others from starting. Previously the awaited
    // tracking call (its own Supabase insert, plus alertAdmin on failure) sat
    // between persistence and the response, so a stall there meant the
    // response never closed and no after() task ran.

    // Track conversion — post-response. trackMarketingEvent itself never
    // throws; the wrapper's onError keeps the previous defense-in-depth
    // nonfatal logging in case a future edit changes that. Event name, path
    // and properties are unchanged. The Request object is read synchronously
    // for headers only, which remains valid after the response.
    runAfterResponse(
      after,
      () =>
        trackMarketingEvent({
          request,
          eventName: "newsletter_subscribed",
          path: "/api/subscribe",
          properties: {
            email_domain: emailDomainOnly(email),
            source: typeof (body as any)?.source === "string" ? String((body as any).source).slice(0, 64) : null,
            honeypot: false,
          },
        }),
      (trackErr) => {
        console.error("[subscribe] tracking failed:", trackErr)
      },
    )

    // Operator notification is sent AFTER the response via the platform
    // completion mechanism (`after()` → Vercel waitUntil): the response still
    // returns immediately, but the function is kept alive until the send
    // settles instead of possibly abandoning an un-awaited promise.
    if (transporter) {
      const recipient = resolveOperatorRecipient("newsletter")

      // Notification to operator. Failure is alerted (dedup'd) so SMTP
      // credential rot doesn't silently drop signups.
      runAfterResponse(
        after,
        () =>
          transporter.sendMail({
            from: `"Website Newsletter" <${process.env.SMTP_USER}>`,
            to: recipient.email,
            subject: "New Newsletter Subscriber",
            html: `
          <h2>New Newsletter Subscriber</h2>
          <p>Someone just subscribed to your newsletter:</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        `,
            replyTo: email,
          }),
        async (err) => {
          safeLogError("subscribe.notify-smtp-failed", {
            subscriberDomain: emailDomain(email),
            err: errorMessage(err),
          })
          await alertAdmin({
            severity: "error",
            subject: "SMTP send failed: newsletter signup notification",
            body:
              "A newsletter signup landed in the database but the operator " +
              "notification email could not be sent. The subscriber row is still " +
              "saved. Verify Porkbun SMTP credentials and connectivity.",
            // PII rule (d01200b): no full subscriber email in alert payloads.
            // Domain-only is enough for triage; admin can look up the row by
            // signup time if a specific user follow-up is needed.
            details: {
              subscriberDomain: emailDomain(email),
              recipientSource: recipient.source,
              errorMessage: errorMessage(err),
            },
            dedupKey: "smtp:subscribe-notification-failed",
          })
        },
      )

      // Subscriber-facing welcome email intentionally disabled (issue #8): a
      // marketing-style welcome must carry a managed unsubscribe. It will be
      // restored as a Resend marketing Automation with {{{RESEND_UNSUBSCRIBE_URL}}}
      // (separate follow-up). The operator "new subscriber" notification above is
      // unchanged.
    }

    // issue #8: sync the subscriber to the Resend "Maya Allan Newsletter" Segment
    // (marketing source of truth). Post-response work, registered as its OWN
    // after() task — separate from the SMTP notification above — so:
    //   - the visitor is never blocked on Resend once the Supabase row is saved;
    //   - Next starts after() callbacks through an unbounded-concurrency queue,
    //     so the notification and the sync begin together and a Resend stall
    //     (the SDK exposes no AbortSignal; a hung request runs to the platform
    //     timeout) cannot keep the notification from starting — previously the
    //     awaited sync sat between the notification's registration and the
    //     response, so a stall meant the response never closed and after()
    //     never ran (Codex review on #47);
    //   - the live route makes ONE attempt per SDK op (no withRateLimit / retry
    //     loop).
    // Outcomes and alerts are unchanged: returned error → dedup'd error alert;
    // noop-no-segment-id → dedup'd warning; noop-no-api-key → nothing (already
    // logged inside the helper); a thrown exception → the SAME sync-failure
    // dedup key via the wrapper's onError. This route remains the single
    // alerting layer for signup-time sync failures.
    runAfterResponse(
      after,
      async () => {
        const sync = await syncSubscriberToResend(email)
        if (sync.status === "error") {
          await alertAdmin({
            severity: "error",
            subject: "Resend newsletter sync failed for a signup",
            body:
              "A newsletter signup was saved to Supabase but syncing the contact to the " +
              "Resend newsletter Segment failed. The subscriber is in the ledger; re-run " +
              "the import script to reconcile.",
            details: { subscriberDomain: emailDomain(email), status: sync.status, detail: "detail" in sync && typeof sync.detail === "string" ? sync.detail : null },
            dedupKey: "resend:newsletter-sync-failed",
          })
        } else if (sync.status === "noop-no-segment-id") {
          await alertAdmin({
            severity: "warning",
            subject: "Resend newsletter sync skipped: RESEND_NEWSLETTER_SEGMENT_ID not set",
            body:
              "RESEND_NEWSLETTER_SEGMENT_ID is not configured, so new signups are not being " +
              "added to the Resend newsletter Segment. Set it in Vercel env.",
            details: { subscriberDomain: emailDomain(email), status: sync.status },
            dedupKey: "resend:newsletter-no-segment-id",
          })
        }
        // noop-no-api-key is already logged inside the helper; alertAdmin needs that
        // same key, so there is nothing to email.
      },
      async (syncErr) => {
        // The helper is written not to throw, but if it ever does, route it through the
        // SAME deduplicated sync-failure alert (not just console.error). Missing API key
        // never reaches here — the helper returns noop-no-api-key instead of throwing.
        console.error("[subscribe] resend newsletter sync threw:", syncErr)
        await alertAdmin({
          severity: "error",
          subject: "Resend newsletter sync failed for a signup",
          body:
            "A newsletter signup was saved to Supabase but the Resend sync threw. The " +
            "subscriber is in the ledger; re-run the import script to reconcile.",
          details: { subscriberDomain: emailDomain(email), status: "threw", detail: errorMessage(syncErr) },
          dedupKey: "resend:newsletter-sync-failed",
        })
      },
    )

    return NextResponse.json({ success: true, message: "Subscribed successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    // Outer-catch alert: if the entire subscribe handler throws, every
    // signup gets a 500 with no operator visibility. Once-per-day dedup
    // covers a sustained outage without flooding the inbox.
    console.error("Subscription error:", error)
    await alertAdmin({
      severity: "error",
      subject: "Subscribe handler threw",
      body:
        "The /api/subscribe handler hit its outer catch. Likely a DB or " +
        "schema regression — newsletter signups are failing with a generic " +
        "500. Check Vercel runtime logs.",
      details: { errorMessage: error instanceof Error ? error.message : String(error) },
      dedupKey: "subscribe:handler-threw",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
    return NextResponse.json({ error: "Subscription failed. Please try again." }, { status: 500 })
  }
}
