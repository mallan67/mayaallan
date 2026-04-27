import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createSessionExportOrder } from "@/lib/paypal"

export const runtime = "nodejs"

type ExportRequest = {
  tool: "reset" | "belief_inquiry" | "integration"
  messages: Array<{ role: "user" | "assistant"; text: string }>
  email: string
}

const MAX_MESSAGES = 50
const MAX_TEXT_LEN = 8000

function validateRequest(body: unknown): ExportRequest {
  if (!body || typeof body !== "object") throw new Error("Invalid body")
  const b = body as Record<string, unknown>

  const tool = b.tool
  if (tool !== "reset" && tool !== "belief_inquiry" && tool !== "integration") {
    throw new Error("Invalid tool")
  }

  const email = b.email
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email")
  }

  const messages = b.messages
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new Error("Invalid messages")
  }

  const normalized: ExportRequest["messages"] = []
  for (const m of messages) {
    if (!m || typeof m !== "object") throw new Error("Invalid message")
    const role = (m as Record<string, unknown>).role
    const text = (m as Record<string, unknown>).text
    if (role !== "user" && role !== "assistant") throw new Error("Invalid role")
    if (typeof text !== "string" || text.length === 0) throw new Error("Invalid text")
    if (text.length > MAX_TEXT_LEN) throw new Error("Text too long")
    normalized.push({ role, text })
  }

  return { tool, email, messages: normalized }
}

export async function POST(req: NextRequest) {
  let body: ExportRequest
  try {
    body = validateRequest(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    )
  }

  const blobKey = `sessions/${crypto.randomUUID()}.json`
  const payload = {
    tool: body.tool,
    messages: body.messages,
    email: body.email,
    sessionDate: new Date().toISOString(),
  }

  try {
    await put(blobKey, JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })
  } catch (err) {
    console.error("Blob staging failed:", err)
    return NextResponse.json({ error: "Could not stage session" }, { status: 500 })
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin
  let checkout: { url: string; orderId: string }
  try {
    checkout = await createSessionExportOrder({
      blobKey,
      customerEmail: body.email,
      tool: body.tool,
      siteUrl: origin,
    })
  } catch (err) {
    console.error("PayPal order creation failed:", err)
    return NextResponse.json({ error: "Could not create checkout" }, { status: 500 })
  }

  return NextResponse.json({ checkoutUrl: checkout.url })
}
