import { redirect } from "next/navigation"
import { requireAdminAuth } from "@/lib/adminAuth"

export default async function AdminPage() {
  // SERVER-SIDE AUTH CHECK - blocks page from loading if not authenticated
  await requireAdminAuth()

  redirect("/admin/books")
}
