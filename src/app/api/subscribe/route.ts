import { NextResponse } from "next/server"
import { createEmailSubscriber } from "@/lib/mock-data"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, source } = subscribeSchema.parse(body)

    await createEmailSubscriber(email, source)

    return NextResponse.json({ success: true, message: "Subscribed successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
  }
}
