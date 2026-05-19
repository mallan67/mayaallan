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
import { saveRun, type AeoRun, type CitationRow } from "@/lib/aeo/storage"

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

  const engineFns: Array<{
    name: "claude" | "chatgpt" | "perplexity" | "gemini"
    fn: (p: string) => Promise<EngineResponse | null>
  }> = [
    { name: "claude", fn: queryClaude },
    { name: "chatgpt", fn: queryChatGPT },
    { name: "perplexity", fn: queryPerplexity },
    { name: "gemini", fn: queryGemini },
  ]

  const enginesRun: string[] = []
  const rows: CitationRow[] = []
  let totalProbes = 0
  let citationHits = 0
  let errors = 0

  for (const prompt of prompts) {
    for (const { name, fn } of engineFns) {
      const result = await fn(prompt.text)
      if (result === null) continue // engine not configured — silently skip

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
  try {
    const blobUrl = await saveRun(aeoRun)
    blobPath = new URL(blobUrl).pathname
  } catch (err) {
    storageError = err instanceof Error ? err.message : String(err)
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
      ...(storageError && { storageError }),
    },
  }
}
