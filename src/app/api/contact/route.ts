import { NextResponse } from "next/server"
import { createContactSubmission } from "@/lib/mock-data"
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

    await createContactSubmission(data)

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
