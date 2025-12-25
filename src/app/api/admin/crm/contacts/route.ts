import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/session"
import { getAllContacts, updateContact, deleteContact } from "@/lib/mock-data"
import { z } from "zod"

const UpdateContactSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]).optional(),
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

  const contacts = await getAllContacts({ status, page, limit })
  return NextResponse.json(contacts)
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const data = UpdateContactSchema.parse(body)
    const contact = await updateContact(id, data)
    
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    
    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 })
  }
  
  const success = await deleteContact(id)
  
  if (!success) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 })
  }
  
  return NextResponse.json({ ok: true })
}
