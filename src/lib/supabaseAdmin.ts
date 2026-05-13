import "server-only"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client with admin/service role privileges.
 *
 * Prefers the new `sb_secret_*` key (env: SUPABASE_SECRET_KEY) and falls back
 * to the legacy JWT service_role key (env: SUPABASE_SERVICE_ROLE_KEY) so the
 * app keeps working during the Supabase key-format migration. When the legacy
 * JWT keys are disabled, only SUPABASE_SECRET_KEY is needed.
 *
 * IMPORTANT: Only use this on the server (API routes, server components).
 * Never expose either key to the client.
 */

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client only if environment variables are available
// This allows the build to succeed even without env vars
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
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
  siteSettings: "SiteSettings",
  retailers: "retailers",
  bookRetailerLinks: "book_retailer_links",
  emailSubscribers: "email_subscribers",
  contactSubmissions: "contact_submissions",
  orders: "orders",
  downloadTokens: "download_tokens",
  events: "Event",  // PascalCase table with camelCase columns
  mediaItems: "media_items",
} as const
