import "server-only"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client with admin/service role privileges.
 * Uses SUPABASE_SERVICE_ROLE_KEY for full database access.
 *
 * IMPORTANT: Only use this on the server (API routes, server components).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client only if environment variables are available
// This allows the build to succeed even without env vars
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _supabaseAdmin
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return Reflect.get(getSupabaseAdmin(), prop)
  },
})

/**
 * Table name mappings (Prisma model -> Supabase table)
 * Supabase uses snake_case table names by convention
 */
export const Tables = {
  books: "books",
  navigationItems: "navigation_items",
  siteSettings: "site_settings",
  retailers: "retailers",
  bookRetailerLinks: "book_retailer_links",
  emailSubscribers: "email_subscribers",
  contactSubmissions: "contact_submissions",
  orders: "orders",
  downloadTokens: "download_tokens",
  events: "events",
  mediaItems: "MediaItem",
} as const
