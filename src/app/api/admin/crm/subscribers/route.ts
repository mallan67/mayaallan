import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllSubscribers, updateSubscriber, deleteSubscriber, exportSubscribers } from "@/lib/mock-data"
import { z } from "zod"

const UpdateSubscriberSchema = z.object({
  status: z.enum(["active", "unsubscribed", "bounced"]).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const format = searchParams.get("format")

  if (format === "csv") {
    const csv = await exportSubscribers()
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=subscribers.csv",
      },
    })
  }

  const subscribers = await getAllSubscribers({ status, page, limit })
  return NextResponse.json(subscribers)
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "Subscriber ID required" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = UpdateSubscriberSchema.parse(body)
    const subscriber = await updateSubscriber(id, data)
    
    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
    }
    
    return NextResponse.json(subscriber)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "Subscriber ID required" }, { status: 400 })
  }
  
  const success = await deleteSubscriber(id)
  
  if (!success) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
  }
  
  return NextResponse.json({ ok: true })
}
