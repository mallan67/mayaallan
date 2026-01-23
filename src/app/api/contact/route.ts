import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import nodemailer from "nodemailer"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  subject: z.string().optional().nullable(),
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
        subject: `New Contact Form Submission from ${data.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, "<br>")}</p>
        `,
        replyTo: data.email,
      }).catch((err) => console.error("Contact email error:", err))
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Contact submission error:", error)
    return NextResponse.json({ error: "Failed to send message", details: errorMessage }, { status: 500 })
  }
}
