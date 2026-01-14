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

  // Require admin credentials to be set in environment variables
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required")
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 })
  }

  // Verify credentials
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
