import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/session"
import { assertAdminSameOrigin } from "@/lib/admin-request-guard"

export async function POST(request: Request) {
  const guard = assertAdminSameOrigin(request)
  if (!guard.ok) return guard.response

  const session = await getAdminSession()
  session.destroy()
  return NextResponse.json({ ok: true })
}
