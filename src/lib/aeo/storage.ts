import "server-only"
import { put, list, del } from "@vercel/blob"

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

/**
 * Default retention — how many of the most recent runs to keep before
 * auto-pruning. Override via env: AEO_KEEP_RUNS=52 for a year of weekly runs.
 *
 * Storage at default (26 runs × ~50KB) = ~1.3MB. Free tier (1GB) is wildly
 * larger than this needs, but keeping a rolling window keeps the dashboard
 * scannable and bounds list/fetch latency.
 */
export const DEFAULT_KEEP_RUNS = 26

function configuredKeepCount(): number {
  const raw = process.env.AEO_KEEP_RUNS
  if (!raw) return DEFAULT_KEEP_RUNS
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_KEEP_RUNS
  return n
}

/**
 * Delete every run blob beyond the most recent `keep`. Returns the number
 * of blobs deleted. Safe to call from the runner after every successful
 * save — caps storage growth and keeps the dashboard fast.
 *
 * Silently no-ops on Blob errors so a transient prune failure can't tank
 * a successful run.
 */
export async function pruneOldRuns(keep: number = configuredKeepCount()): Promise<number> {
  try {
    // Pull a generous window so we don't miss any old blobs.
    const listing = await list({ prefix: RUN_PREFIX, limit: 1000 })
    const sorted = [...listing.blobs].sort((a, b) =>
      a.pathname < b.pathname ? 1 : a.pathname > b.pathname ? -1 : 0
    )
    const toDelete = sorted.slice(keep)
    if (toDelete.length === 0) return 0
    await del(toDelete.map((b) => b.url))
    return toDelete.length
  } catch (err) {
    console.warn("[aeo] pruneOldRuns failed (non-fatal):", err)
    return 0
  }
}

/**
 * Delete EVERY AEO run blob. Used by the admin "Clear all" button.
 * Returns the number of blobs deleted.
 */
export async function deleteAllRuns(): Promise<number> {
  let total = 0
  // list() paginates implicitly at 1000 — loop in case there are more.
  // Defensive: also bound the loop so we can't infinite-loop on a bug.
  for (let i = 0; i < 50; i++) {
    const listing = await list({ prefix: RUN_PREFIX, limit: 1000 })
    if (listing.blobs.length === 0) break
    await del(listing.blobs.map((b) => b.url))
    total += listing.blobs.length
    if (listing.blobs.length < 1000) break
  }
  return total
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
