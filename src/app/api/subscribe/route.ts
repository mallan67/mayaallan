import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import nodemailer from "nodemailer"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email(),
})

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
      // Notification to Maya
      transporter.sendMail({
        from: `"Website Newsletter" <${process.env.SMTP_USER}>`,
        to: "maya@mayaallan.com",
        subject: "New Newsletter Subscriber",
        html: `
          <h2>New Newsletter Subscriber</h2>
          <p>Someone just subscribed to your newsletter:</p>
          <p><strong>Email:</strong> ${email}</p>
        `,
        replyTo: email,
      }).catch((err) => console.error("Notification email error:", err))

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
      }).catch((err) => console.error("Welcome email error:", err))
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Subscription failed", details: errorMessage }, { status: 500 })
  }
}
