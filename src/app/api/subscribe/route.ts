import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
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

    // Track conversion. Wrapped — trackMarketingEvent itself never throws,
    // but defense-in-depth keeps any future edit from breaking signup.
    try {
      await trackMarketingEvent({
        request,
        eventName: "newsletter_subscribed",
        path: "/api/subscribe",
        properties: {
          email_domain: emailDomainOnly(email),
          source: typeof (body as any)?.source === "string" ? String((body as any).source).slice(0, 64) : null,
          honeypot: false,
        },
      })
    } catch (trackErr) {
      console.error("[subscribe] tracking failed:", trackErr)
    }

    // Send emails asynchronously (don't await - return response immediately)
    if (transporter) {
      const recipient = resolveOperatorRecipient("newsletter")

      // Notification to operator. Failure is alerted (dedup'd) so SMTP
      // credential rot doesn't silently drop signups.
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
      }).catch(async (err) => {
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
            errorMessage: err?.message ?? String(err),
          },
          dedupKey: "smtp:subscribe-notification-failed",
        })
      })

      // Subscriber-facing welcome email intentionally disabled (issue #8): a
      // marketing-style welcome must carry a managed unsubscribe. It will be
      // restored as a Resend marketing Automation with {{{RESEND_UNSUBSCRIBE_URL}}}
      // (separate follow-up). The operator "new subscriber" notification above is
      // unchanged.
    }

    // issue #8: sync the subscriber to the Resend "Maya Allan Newsletter" Segment
    // (marketing source of truth). Awaited normally — NOT Promise.race (which would
    // not cancel the underlying request) and NOT raw HTTP. Nonfatal semantics:
    //   - the Supabase row is already saved before this runs;
    //   - a returned Resend error OR a thrown exception is handled here and we still
    //     return success;
    //   - the installed SDK's get options expose no AbortSignal and it directly
    //     awaits fetch, so a hung Resend request cannot be cancelled — a
    //     platform-level function timeout could still prevent the HTTP success
    //     response (the signup is already persisted regardless);
    //   - the live route makes ONE attempt per SDK op (no withRateLimit / retry
    //     loop), which bounds added latency.
    // This route is the single alerting layer for signup-time sync failures.
    try {
      const sync = await syncSubscriberToResend(email)
      if (sync.status === "error") {
        await alertAdmin({
          severity: "error",
          subject: "Resend newsletter sync failed for a signup",
          body:
            "A newsletter signup was saved to Supabase but syncing the contact to the " +
            "Resend newsletter Segment failed. The subscriber is in the ledger; re-run " +
            "the import script to reconcile.",
          details: { subscriberDomain: emailDomain(email), status: sync.status, detail: (sync as any).detail ?? null },
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
    } catch (syncErr) {
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
    }

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
