import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import nodemailer from "nodemailer"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { alertAdmin } from "@/lib/alert-admin"
import { resolveOperatorRecipient } from "@/lib/operator-email"
import { trackMarketingEvent, emailDomainOnly, messageLengthBucket } from "@/lib/marketing-events"
import { safeLogError, emailDomain, errorMessage } from "@/lib/safe-log"

/**
 * Contact form: stricter validation + honeypot + centralized recipient.
 *
 * Validation (PR D tightening):
 *   - name      trim, 1-120
 *   - email     trim, lowercase, valid email, max 254 (RFC 5321 path-local limit)
 *   - subject   trim, max 160, nullable
 *   - message   trim, 1-5000
 *   - company   honeypot. If present + non-empty, return success without
 *               storing or emailing. Real humans don't fill hidden fields;
 *               most bots do.
 *
 * Rate-limit + alertAdmin behavior unchanged from PR B.
 */
const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(1).max(5000),
  subject: z.string().trim().max(160).optional().nullable(),
  // Honeypot — hidden field on the form. Bots will populate it; we
  // return success but do nothing.
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
  // Throttle to 5 submissions per IP per hour to deter form spam.
  // FAIL-OPEN: rateLimit() throws in prod if Upstash is unreachable. For a
  // public conversion form, a Redis blip must NOT 500 a real visitor — degrade
  // to "allowed" (spam protection temporarily off) instead of blocking.
  let limit: { allowed: boolean; retryAfterSeconds?: number }
  try {
    limit = await rateLimit({
      scope: "contact",
      ip: getClientIp(request),
      windowMs: 60 * 60 * 1000,
      maxAttempts: 5,
      lockoutMs: 60 * 60 * 1000,
    })
  } catch (rlErr) {
    console.error("[contact] rate-limit unavailable, allowing through:", rlErr)
    limit = { allowed: true }
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) } },
    )
  }

  try {
    const body = await request.json()
    const data = ContactSchema.parse(body)

    // Honeypot — pretend success, don't write to DB, don't send email.
    if (data.company && data.company.trim().length > 0) {
      return NextResponse.json({ success: true, message: "Message sent successfully" })
    }

    // Save to database (direct Postgres; unqualified name resolves via search_path).
    try {
      await sql`
        insert into contact_submissions (name, email, message, subject)
        values (${data.name}, ${data.email}, ${data.message}, ${data.subject || null})
      `
    } catch (dbErr) {
      console.error("Contact insert error:", dbErr instanceof Error ? dbErr.message : String(dbErr))
      throw dbErr
    }

    // Track conversion.
    try {
      await trackMarketingEvent({
        request,
        eventName: "contact_submitted",
        path: "/api/contact",
        properties: {
          email_domain: emailDomainOnly(data.email),
          subject_present: !!(data.subject && data.subject.length > 0),
          message_length: messageLengthBucket(data.message),
          honeypot: false,
        },
      })
    } catch (trackErr) {
      console.error("[contact] tracking failed:", trackErr)
    }

    // Send email notification asynchronously (don't await - return response immediately)
    if (transporter) {
      const recipient = resolveOperatorRecipient("contact")
      transporter.sendMail({
        from: `"Website Contact" <${process.env.SMTP_USER}>`,
        to: recipient.email,
        subject: `New Contact Form Submission from ${escapeHtml(data.name)}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        `,
        replyTo: data.email,
      }).catch(async (err) => {
        safeLogError("contact.smtp-send-failed", {
          submitterDomain: emailDomain(data.email),
          err: errorMessage(err),
        })
        await alertAdmin({
          severity: "error",
          subject: "SMTP send failed: contact form notification",
          body:
            "A contact form submission landed in the database but the notification " +
            "email could not be sent. The submission row is still saved. Verify " +
            "Porkbun SMTP credentials and connectivity, then read the submission " +
            "in the admin panel.",
          // PII rule (d01200b): no full submitter email in alert payloads.
          // The submission row in supabase has the full email if Maya needs
          // to follow up; the dedup key + timestamp lets her find it.
          details: {
            submitterDomain: emailDomain(data.email),
            recipientSource: recipient.source,
            errorMessage: err?.message ?? String(err),
          },
          dedupKey: "smtp:contact-notification-failed",
        })
      })
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }
    // Outer-catch alert: if the entire handler throws (DB out, alert
    // path broken, etc.), the user sees a generic 500. Without this
    // alert, you'd find out via a customer complaint about an unanswered
    // form. Once-per-day dedup so a sustained outage doesn't flood.
    console.error("Contact submission error:", error)
    await alertAdmin({
      severity: "error",
      subject: "Contact form handler threw",
      body:
        "The /api/contact handler hit its outer catch. Likely DB or " +
        "Resend regression — customers' contact-form submissions are " +
        "failing with a generic 500. Check Vercel runtime logs.",
      details: { errorMessage: error instanceof Error ? error.message : String(error) },
      dedupKey: "contact:handler-threw",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}
