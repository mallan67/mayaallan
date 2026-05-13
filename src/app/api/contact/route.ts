import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import nodemailer from "nodemailer"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { alertAdmin } from "@/lib/alert-admin"

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  subject: z.string().optional().nullable(),
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
  const limit = rateLimit({
    scope: "contact",
    ip: getClientIp(request),
    windowMs: 60 * 60 * 1000,
    maxAttempts: 5,
    lockoutMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) } },
    )
  }

  try {
    const body = await request.json()
    const data = ContactSchema.parse(body)

    // Save to database
    const { error } = await supabaseAdmin
      .from(Tables.contactSubmissions)
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        subject: data.subject || null,
      })

    if (error) {
      console.error("Supabase insert error:", error.message, error.code, error.details)
      throw error
    }

    // Send email notification asynchronously (don't await - return response immediately)
    if (transporter) {
      transporter.sendMail({
        from: `"Website Contact" <${process.env.SMTP_USER}>`,
        to: "maya@mayaallan.com",
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
        console.error("Contact email error:", err)
        await alertAdmin({
          severity: "error",
          subject: "SMTP send failed: contact form notification",
          body:
            "A contact form submission landed in the database but the notification " +
            "email to maya@mayaallan.com could not be sent. The submission row is " +
            "still saved. Verify Porkbun SMTP credentials and connectivity, then " +
            "read the submission in the admin panel.",
          details: { submitterEmail: data.email, errorMessage: err?.message ?? String(err) },
          dedupKey: "smtp:contact-notification-failed",
        })
      })
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }
    // Log full detail server-side; return generic message to client to avoid
    // leaking schema/constraint hints from Supabase or other internals.
    console.error("Contact submission error:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}
