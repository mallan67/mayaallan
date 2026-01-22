import { NextResponse } from "next/server"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, source } = subscribeSchema.parse(body)

    // Use upsert to avoid duplicate email errors
    const { error } = await supabaseAdmin
      .from(Tables.emailSubscribers)
      .upsert(
        { email, source: source || null },
        { onConflict: "email", ignoreDuplicates: true }
      )

    if (error) throw error

    return NextResponse.json({ success: true, message: "Subscribed successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
  }
}
