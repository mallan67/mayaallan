import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email(),
  message: z.string().min(1),
  source: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = ContactSchema.parse(body)

    await prisma.contactSubmission.create({
      data: {
        name: data.name || null,
        email: data.email,
        message: data.message,
        source: data.source || null,
      },
    })

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 })
    }
    console.error("Contact submission error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
