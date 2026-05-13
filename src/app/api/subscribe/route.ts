import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import nodemailer from "nodemailer"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { alertAdmin } from "@/lib/alert-admin"

const subscribeSchema = z.object({
  email: z.string().email(),
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
  const limit = rateLimit({
    scope: "subscribe",
    ip: getClientIp(request),
    windowMs: 60 * 60 * 1000,
    maxAttempts: 10,
    lockoutMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) } },
    )
  }

  try {
    const body = await request.json()
    const { email } = subscribeSchema.parse(body)

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

    // Send emails asynchronously (don't await - return response immediately)
    if (transporter) {
      // Notification to Maya. Customer response is already in flight; this
      // is a fire-and-forget send. Failure is alerted (dedup'd) so SMTP
      // credential rot doesn't silently drop signups.
      transporter.sendMail({
        from: `"Website Newsletter" <${process.env.SMTP_USER}>`,
        to: "maya@mayaallan.com",
        subject: "New Newsletter Subscriber",
        html: `
          <h2>New Newsletter Subscriber</h2>
          <p>Someone just subscribed to your newsletter:</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        `,
        replyTo: email,
      }).catch(async (err) => {
        console.error("Notification email error:", err)
        await alertAdmin({
          severity: "error",
          subject: "SMTP send failed: newsletter signup notification",
          body:
            "A newsletter signup landed in the database but the notification email " +
            "to maya@mayaallan.com could not be sent. The subscriber row is still " +
            "saved. Verify Porkbun SMTP credentials and connectivity.",
          details: { subscriberEmail: email, errorMessage: err?.message ?? String(err) },
          dedupKey: "smtp:subscribe-notification-failed",
        })
      })

      // Welcome email to subscriber
      transporter.sendMail({
        from: `"Maya Allan" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to the Newsletter!",
        html: `
          <h2>Thanks for Subscribing!</h2>
          <p>You've been added to the newsletter. You'll receive updates about new releases, events, and more.</p>
          <p>Best,<br>Maya Allan</p>
        `,
      }).catch(async (err) => {
        console.error("Welcome email error:", err)
        await alertAdmin({
          severity: "error",
          subject: "SMTP send failed: newsletter welcome email",
          body:
            "Welcome email to a new subscriber failed to send. The subscriber row " +
            "is still saved in the database. Send a manual welcome if needed.",
          details: { subscriberEmail: email, errorMessage: err?.message ?? String(err) },
          dedupKey: "smtp:subscribe-welcome-failed",
        })
      })
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    // Log full detail server-side; return generic message to client.
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Subscription failed. Please try again." }, { status: 500 })
  }
}
