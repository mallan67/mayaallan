import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSession } from "@/lib/session"

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const MOCK_ADMIN = {
  id: 1,
  email: "admin@mayaallan.com",
  // Password: "password123" (hashed)
  passwordHash: "$2a$10$YourHashedPasswordHere",
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const { email, password } = parsed.data

  if (email !== MOCK_ADMIN.email) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // In production with database, use: await bcrypt.compare(password, MOCK_ADMIN.passwordHash)
  const ok = password.length >= 8

  if (!ok) return NextResponse.json({ ok: false }, { status: 401 })

  const session = await getAdminSession()
  session.adminId = MOCK_ADMIN.id.toString()
  await session.save()

  return NextResponse.json({ ok: true })
}
