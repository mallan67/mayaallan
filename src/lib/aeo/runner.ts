import "server-only"
import { randomUUID } from "node:crypto"
import { loadPrompts } from "@/lib/aeo/prompts"
import { detectCitation } from "@/lib/aeo/detect"
import {
  queryClaude,
  queryChatGPT,
  queryPerplexity,
  queryGemini,
  type EngineResponse,
} from "@/lib/aeo/engines"
import { saveRun, pruneOldRuns, type AeoRun, type CitationRow } from "@/lib/aeo/storage"
import { alertAdmin } from "@/lib/alert-admin"

// =============================================================================
// Tuning knobs (override via env)
// =============================================================================
//
// AEO_ENGINES — comma-separated allow-list of engine names. When set, only
// these engines run; everything else is skipped. Useful for users who only
// want to spend on one provider (e.g., AEO_ENGINES=claude when you have
// Anthropic credit and don't want to burn Vercel AI Gateway credits on the
// other three). Unset = all configured engines run.
//   Valid values: claude, chatgpt, perplexity, gemini
//
// AEO_CONCURRENCY — how many prompts to probe concurrently. Each in-flight
// prompt fires every enabled engine in parallel internally. Default 5 means
// at any moment 5 prompts × N engines are in flight, which keeps each
// provider under ~5 RPM for safety. Bump if you have higher rate limits.
//
// With defaults (4 engines, concurrency 5) the full 25-prompt run takes
// ~max_engine_time × 5 batches ≈ 25-40 seconds total.
function parseEngineAllowList(): Set<string> | null {
  const raw = process.env.AEO_ENGINES?.trim()
  if (!raw) return null
  return new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
}

function parseConcurrency(): number {
  const raw = process.env.AEO_CONCURRENCY
  if (!raw) return 5
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 5
  return Math.min(n, 25) // cap at 25 — no point exceeding prompt count
}

// =============================================================================
// AEO probe runner — shared by:
//   - the weekly cron at /api/cron/aeo-track
//   - the admin "Run now" button at /api/admin/aeo/run-now
//
// Sequentially queries every enabled AI engine with every prompt, runs the
// citation detector against each response, writes the full run as one JSON
// blob to Vercel Blob, and returns a structured summary.
// =============================================================================

export interface RunSummary {
  runId: string
  startedAt: string
  finishedAt: string
  promptsCount: number
  enginesRun: string[]
  totalProbes: number
  citationHits: number
  errors: number
  blobPath?: string
  /** Number of old runs auto-deleted by retention policy after this run. */
  prunedOldRuns?: number
  storageError?: string
}

export async function executeRun(): Promise<
  | { ok: true; summary: RunSummary }
  | { ok: false; error: string }
> {
  const startedAt = new Date()
  const runId = randomUUID()

  const prompts = await loadPrompts()
  if (prompts.length === 0) {
    return { ok: false, error: "No prompts loaded from content/aeo-prompts.json" }
  }

  const allowedEngines = parseEngineAllowList()
  const engineFns: Array<{
    name: "claude" | "chatgpt" | "perplexity" | "gemini"
    fn: (p: string) => Promise<EngineResponse | null>
  }> = (
    [
      { name: "claude", fn: queryClaude },
      { name: "chatgpt", fn: queryChatGPT },
      { name: "perplexity", fn: queryPerplexity },
      { name: "gemini", fn: queryGemini },
    ] as const
  ).filter((e) => !allowedEngines || allowedEngines.has(e.name))

  const enginesRun: string[] = []
  const rows: CitationRow[] = []
  let totalProbes = 0
  let citationHits = 0
  let errors = 0

  // Concurrent prompt batches × parallel engines per prompt.
  //
  // Layout:
  //   - Up to AEO_CONCURRENCY prompts (default 5) are in flight at once.
  //   - Each in-flight prompt fires every enabled engine in parallel.
  //   - So in-flight calls = concurrency × enabled_engines (default 5 × N).
  //
  // With 4 engines + concurrency 5 = 20 concurrent calls. Each provider sees
  // at most 5 simultaneous calls from us, which stays comfortably under most
  // free / low-tier rate limits.
  //
  // Total wall time: ceil(prompts / concurrency) × max_engine_time
  //   = ceil(25 / 5) × ~5 sec = ~25 seconds for the full 25-prompt run.
  const concurrency = parseConcurrency()
  async function probeOnePrompt(prompt: (typeof prompts)[number]) {
    const settled = await Promise.all(
      engineFns.map(async ({ name, fn }) => {
        const result = await fn(prompt.text)
        return { name, result }
      })
    )
    return { prompt, settled }
  }

  for (let i = 0; i < prompts.length; i += concurrency) {
    const batch = prompts.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(probeOnePrompt))

    for (const { prompt, settled } of batchResults) {
      for (const { name, result } of settled) {
        if (result === null) continue

        if (!enginesRun.includes(name)) enginesRun.push(name)
        totalProbes++

        if (result.error) {
          errors++
          rows.push({
            engine: name,
            prompt: prompt.text,
            prompt_id: prompt.id,
            prompt_category: prompt.category,
            was_cited: false,
            mention_types: [],
            cited_urls: [],
            excerpt: null,
            response_chars: 0,
            error: result.error,
          })
          continue
        }

        const detection = detectCitation(result.content)
        if (detection.wasCited) citationHits++

        rows.push({
          engine: name,
          prompt: prompt.text,
          prompt_id: prompt.id,
          prompt_category: prompt.category,
          was_cited: detection.wasCited,
          mention_types: detection.mentionTypes,
          cited_urls: detection.citedUrls,
          excerpt: detection.excerpt,
          response_chars: result.content.length,
          error: null,
        })
      }
    }
  }

  if (enginesRun.length === 0) {
    return {
      ok: false,
      error:
        "No AI engine API keys configured. Set at least one of: GOOGLE_GENERATIVE_AI_API_KEY (free), ANTHROPIC_API_KEY, OPENAI_API_KEY, PERPLEXITY_API_KEY.",
    }
  }

  const finishedAt = new Date()
  const aeoRun: AeoRun = {
    runId,
    runAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    promptsCount: prompts.length,
    enginesRun,
    totalProbes,
    citationHits,
    errors,
    rows,
  }

  let storageError: string | undefined
  let blobPath: string | undefined
  let pruned: number | undefined
  try {
    const blobUrl = await saveRun(aeoRun)
    blobPath = new URL(blobUrl).pathname
    // Best-effort prune of older runs so storage doesn't grow unbounded.
    // pruneOldRuns is wrapped in its own try/catch so a prune failure can't
    // mask the success of the save.
    pruned = await pruneOldRuns()
  } catch (err) {
    storageError = err instanceof Error ? err.message : String(err)
    // Previously this storage failure was packed into the summary's
    // `storageError` field, the cron route checked only `result.ok` (which
    // remained true), and the dashboard timestamps silently stopped
    // moving. Every weekly run since the regression would burn ~$0.50-$2
    // in LLM credits with no recorded data.
    //
    // Alert now. 7-day dedup because the cron only runs weekly and we
    // don't need a fresh alert on every run during a sustained outage.
    await alertAdmin({
      severity: "error",
      subject: "AEO cron: storage failed (LLM credits burned, data lost)",
      body:
        "executeRun() completed its probe phase successfully but saveRun() " +
        "threw. The AEO dashboard will show no new data, but the LLM credits " +
        "were spent. Likely cause: Vercel Blob token rotated, namespace " +
        "changed, or storage account hit a quota. Check /api/health?deep=1 " +
        "blob check + Vercel Blob dashboard.",
      details: { runId, storageError },
      dedupKey: "aeo:storage-failed",
      dedupWindowMs: 7 * 24 * 60 * 60 * 1000,
    })
  }

  return {
    ok: true,
    summary: {
      runId,
      startedAt: aeoRun.runAt,
      finishedAt: aeoRun.finishedAt,
      promptsCount: prompts.length,
      enginesRun,
      totalProbes,
      citationHits,
      errors,
      ...(blobPath && { blobPath }),
      ...(typeof pruned === "number" && pruned > 0 && { prunedOldRuns: pruned }),
      ...(storageError && { storageError }),
    },
  }
}
