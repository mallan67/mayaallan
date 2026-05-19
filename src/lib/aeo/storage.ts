import "server-only"
import { put, list } from "@vercel/blob"

// =============================================================================
// AEO storage — Vercel Blob backend.
// =============================================================================
// Each weekly run writes one JSON blob at:
//   aeo/runs/{ISO-timestamp}-{runId}.json
//
// Why Vercel Blob (vs Supabase):
//   1. Supabase Free has no auto backups — a schema change is harder to roll
//      back if something goes wrong. Blob is file-based with no schema.
//   2. Completely separate service from the main app data — zero risk of
//      affecting books/events/etc. by construction.
//   3. Free tier (1GB storage + 10GB egress/mo) is ~330x what this needs.
//   4. AEO data scale is ~50KB/week — well within instant-load territory
//      for the dashboard.
//
// Existing Blob usage on this project (won't collide):
//   - sessions/*  → tool-export staging files
//   - uploads/*   → admin uploads (book covers, ebook PDFs)
//   - aeo/runs/*  → NEW, exclusive to this tracker
// =============================================================================

const RUN_PREFIX = "aeo/runs/"

/** One row of probe data (engine × prompt × hit/miss). */
export interface CitationRow {
  engine: "claude" | "chatgpt" | "perplexity" | "gemini"
  prompt: string
  prompt_id: string
  prompt_category: string
  was_cited: boolean
  mention_types: string[]
  cited_urls: string[]
  excerpt: string | null
  response_chars: number
  error: string | null
}

/** One weekly run = many rows + a top-level summary. */
export interface AeoRun {
  runId: string
  runAt: string // ISO 8601
  finishedAt: string
  promptsCount: number
  enginesRun: string[]
  totalProbes: number
  citationHits: number
  errors: number
  rows: CitationRow[]
}

/**
 * Persist one weekly run as a JSON blob. Returns the public blob URL
 * (caller doesn't need it; list() finds blobs on read).
 *
 * Blobs are `access: "public"` because the Hobby/Pro Blob tier doesn't
 * support private blobs. URLs are unguessable random tokens — fine for
 * AEO data, which is operational measurement, not sensitive.
 */
export async function saveRun(run: AeoRun): Promise<string> {
  // ISO-timestamp prefix in the filename makes blob `list()` results sort
  // chronologically by pathname — no separate ordering step needed.
  const safeTimestamp = run.runAt.replace(/[:.]/g, "-")
  const path = `${RUN_PREFIX}${safeTimestamp}-${run.runId}.json`

  const body = JSON.stringify(run)
  const result = await put(path, body, {
    access: "public",
    contentType: "application/json",
    // Deterministic filename so a manual re-trigger of the same runId
    // overwrites rather than accumulating duplicates.
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  return result.url
}

/**
 * Load the N most recent runs (default 30 weeks). Returns runs newest-first
 * with full row payloads included.
 *
 * Gracefully returns [] on Blob errors so the admin dashboard shows a
 * "no data yet" state rather than crashing on a fresh deploy.
 */
export async function loadRecentRuns(limit = 30): Promise<AeoRun[]> {
  let listing: Awaited<ReturnType<typeof list>>
  try {
    // Fetch headroom (max 1000) so we can sort+slice deterministically even
    // if blob upload order ever drifts from pathname order.
    listing = await list({ prefix: RUN_PREFIX, limit: Math.max(limit * 3, 100) })
  } catch (err) {
    console.warn("[aeo] Blob list() failed — returning empty:", err)
    return []
  }

  // Sort by pathname descending (ISO timestamp prefix = chronological).
  const sorted = [...listing.blobs].sort((a, b) =>
    a.pathname < b.pathname ? 1 : a.pathname > b.pathname ? -1 : 0
  )
  const top = sorted.slice(0, limit)

  // Parallel fetch — URLs are public but unguessable; only the dashboard
  // (admin-gated) ever sees them.
  const runs = await Promise.all(
    top.map(async (b) => {
      try {
        const res = await fetch(b.url, { cache: "no-store" })
        if (!res.ok) return null
        return (await res.json()) as AeoRun
      } catch (err) {
        console.warn(`[aeo] Failed to fetch run blob ${b.pathname}:`, err)
        return null
      }
    })
  )

  return runs.filter((r): r is AeoRun => r !== null)
}

/** Flatten rows across multiple runs — useful for cross-run aggregations. */
export function allRows(
  runs: AeoRun[]
): Array<CitationRow & { run_id: string; run_at: string }> {
  const out: Array<CitationRow & { run_id: string; run_at: string }> = []
  for (const run of runs) {
    for (const row of run.rows) {
      out.push({ ...row, run_id: run.runId, run_at: run.runAt })
    }
  }
  return out
}
