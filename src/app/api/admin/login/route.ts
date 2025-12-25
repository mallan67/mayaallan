import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSession } from "@/lib/session"

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
  }

  const { email, password } = parsed.data

  // Check against environment variables (single admin)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@mayaallan.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })
  }

  // Set session
  const session = await getAdminSession()
  session.adminId = "1"
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ ok: true })
}
