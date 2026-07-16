import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { syncContact, classifyContact, withRateLimit } from "../src/lib/resend-newsletter.mjs"

/**
 * One-time backfill of active Supabase subscribers into the Resend newsletter
 * Segment. Reuses the SAME rules as live signup. --dry-run is the DEFAULT and is
 * completely write-free; pass --apply to perform writes. Request pacing + 429
 * backoff live inside withRateLimit at the per-SDK-CALL level (NOT per row).
 *
 * Run:
 *   node --env-file=.env.local scripts/import-subscribers-to-resend.mjs            # dry-run
 *   node --env-file=.env.local scripts/import-subscribers-to-resend.mjs --apply    # real
 *
 * Requires env: SUPABASE_URL, SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY),
 *               RESEND_API_KEY, RESEND_NEWSLETTER_SEGMENT_ID
 */

const PAGE_SIZE = 1000

/** True when any row failed — used to set a nonzero exit code. */
export function importHadErrors(counts) {
  return (counts.error ?? 0) > 0
}

export async function runImport({ rows, resend, segmentId, apply, log = console }) {
  const counts = {}
  const bump = (s) => { counts[s] = (counts[s] ?? 0) + 1 }
  for (const row of rows) {
    const res = apply
      ? await syncContact({ resend, segmentId, email: row.email })
      : await classifyContact({ resend, segmentId, email: row.email })
    bump(res.status)
    if (res.status === "error") log.warn?.(`[import] row error: ${res.detail ?? "unknown"}`)
  }
  return counts
}

/** Read active subscribers in stable, ordered pages until a short page ends it. */
export async function readActiveSubscribers(supabase) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("email_subscribers")
      .select("email")
      .is("unsubscribed_at", null)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`supabase read failed: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }
  return rows
}

async function main() {
  const apply = process.argv.includes("--apply")
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.RESEND_API_KEY
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID

  const missing = []
  if (!url) missing.push("SUPABASE_URL")
  if (!key) missing.push("SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY")
  if (!apiKey) missing.push("RESEND_API_KEY")
  if (!segmentId) missing.push("RESEND_NEWSLETTER_SEGMENT_ID")
  if (missing.length) {
    console.error(`[import] missing required env: ${missing.join(", ")}`)
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  let rows
  try {
    rows = await readActiveSubscribers(supabase)
  } catch (e) {
    console.error(`[import] ${e.message}`)
    process.exit(1)
  }

  const resend = withRateLimit(new Resend(apiKey), { log: console })
  console.log(`[import] mode=${apply ? "APPLY" : "DRY-RUN"} rows=${rows.length} segment=${segmentId}`)
  const counts = await runImport({ rows, resend, segmentId, apply, log: console })
  console.log("[import] counts:", JSON.stringify(counts))

  if (importHadErrors(counts)) {
    console.error(`[import] FAILED: ${counts.error} row(s) errored — NOT a clean import. Fix and re-run (idempotent).`)
    process.exit(1)
  }
  console.log("[import] completed with no row errors.")
}

// Run only when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("import-subscribers-to-resend.mjs")) {
  main().catch((e) => { console.error("[import] fatal:", e); process.exit(1) })
}
