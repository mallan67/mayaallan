import "server-only"
import postgres from "postgres"
import { pgTypes } from "./db-types"

/**
 * Server-only direct Postgres client.
 *
 * This replaces the Supabase Data API (PostgREST) access path used by
 * `supabaseAdmin`. The application talks to the database over a direct, pooled
 * Postgres connection so that NO application schema has to be exposed through
 * Supabase's Data API — which is what the Security Advisor flags. Never import
 * this from client components.
 *
 * Connection: Supabase's serverless transaction pooler (pgbouncer). Prepared
 * statements MUST be disabled for transaction-mode pooling.
 *
 * Schema resolution is handled by the connection role's `search_path` (set in
 * the database), not by hard-coding schema names in queries. During the
 * migration the application tables live in `public`; at cutover they move to
 * `app_private` and the role's search_path is repointed in the same step, so
 * the unqualified table names in application queries resolve correctly on both
 * sides of the move without any code change.
 */

// Dedicated, server-only connection string for THIS Supabase project's Postgres
// (the transaction pooler). Intentionally does NOT fall back to DATABASE_URL /
// POSTGRES_URL: those can be injected by unrelated Vercel integrations, and
// silently connecting to the wrong database is worse than failing. Set
// SUPABASE_DATABASE_URL (Vercel env + local .env) to the Supabase transaction
// pooler connection string. Missing => fail closed.
const connectionString = process.env.SUPABASE_DATABASE_URL

let client: ReturnType<typeof postgres> | null = null

function getClient(): ReturnType<typeof postgres> {
  if (client) return client
  if (!connectionString) {
    throw new Error(
      "Missing SUPABASE_DATABASE_URL for the direct Postgres client",
    )
  }
  client = postgres(connectionString, {
    prepare: false, // required by the Supabase transaction pooler (pgbouncer)
    ssl: "require",
    max: 1, // serverless: one socket per warm function instance
    idle_timeout: 20,
    connect_timeout: 15,
    // Send search_path as a startup parameter on EVERY connection. This does
    // NOT depend on the role's default (ALTER ROLE ... SET search_path only
    // affects NEW sessions, so warm pooled connections would keep the old
    // default across a cutover and break). Before app_private exists Postgres
    // silently skips it and resolves unqualified names via public; after the
    // objects move, the same path resolves app_private first — no
    // warm-connection outage.
    //
    // MUST be committed + deployed BEFORE the cutover. After cutover + smoke
    // test, tighten to "app_private,pg_catalog" (drop public).
    connection: {
      application_name: "mayaallan",
      search_path: "app_private,public,pg_catalog",
    },
    // Value-shape coercers (see src/lib/db-types.ts for the full rationale):
    //   int8 (bigint)          -> JS number when safe-integer, else exact string
    //   numeric / decimal      -> left as string (money-safe; never float)
    //   int2 / int4            -> JS number (postgres.js default; amount_cents,
    //                             download_count, max_downloads, sort_order)
    //   timestamp/timestamptz  -> ISO-8601 string
    types: pgTypes,
  })
  return client
}

/**
 * Tagged-template SQL client. Values interpolated with `${...}` are always sent
 * as bound parameters (never concatenated into the SQL text), so queries built
 * with it are injection-safe. Dynamic identifiers must use the `sql(name)` form.
 *
 * Lazily initialized via a Proxy so that importing this module never opens a
 * connection at build time or in code paths that don't touch the database.
 */
export const sql: postgres.Sql = new Proxy(
  function () {} as unknown as postgres.Sql,
  {
    apply(_target, _thisArg, args: unknown[]) {
      // Supports both sql`...` (template) and sql(identifier)/sql(values) forms.
      return (getClient() as (...a: unknown[]) => unknown)(...args)
    },
    get(_target, prop) {
      return getClient()[prop as keyof postgres.Sql]
    },
  },
)
