/* eslint-disable @typescript-eslint/no-explicit-any -- Provider web-search APIs return heterogeneous JSON block shapes; every accessed field is runtime-guarded before use. */
import "server-only"
import { generateText } from "ai"

// =============================================================================
// AEO Engine clients — one minimal client per AI engine.
// =============================================================================
// Each function:
//   - Returns null immediately if the engine's API key env var isn't set
//     (so the AEO tracker gracefully skips engines you haven't enrolled in)
//   - Uses raw fetch — no SDK dependencies — so adding/removing providers
//     doesn't churn package.json
//   - Returns { content, model, error? } — error captured rather than thrown
//     so one engine's outage doesn't tank the weekly run
//
// API KEYS:
//   ANTHROPIC_API_KEY      — Claude (claude.ai/console)
//   OPENAI_API_KEY         — ChatGPT (platform.openai.com)
//   PERPLEXITY_API_KEY     — Perplexity (perplexity.ai/settings/api)
//   GOOGLE_GENAI_API_KEY   — Gemini (aistudio.google.com/apikey)
//
// Costs (May 2026): rough estimates for 25 prompts × weekly:
//   Claude   — ~$0.10/week (sonnet)
//   OpenAI   — ~$0.30/week (gpt-4o-mini)
//   Perplexity — ~$0.20/week (sonar)
//   Gemini   — free tier covers it
// Total ~$2.50/month if all four are enabled.
// =============================================================================

export type EngineName = "claude" | "chatgpt" | "perplexity" | "gemini"

export interface EngineResponse {
  engine: EngineName
  content: string
  model: string
  /**
   * Whether this specific probe consulted or could consult the live web.
   * Direct grounded calls return true; AI Gateway fallback completions return
   * false except Perplexity Sonar, which is search-backed.
   */
  searchCapable: boolean
  /** Source URLs the search-grounded engine returned separately from answer text. */
  citations?: string[]
  /** Search queries executed by the provider, when exposed by its API. */
  searchQueries?: string[]
  /** Every web source consulted/returned, including sources not ultimately cited. */
  sourceUrls?: string[]
  /** Set if the call failed. content will be empty. */
  error?: string
}

/** Search capability of the AI Gateway fallback path. Direct provider calls
 *  may override this by returning searchCapable:true after using web search. */
export const ENGINE_SEARCH_CAPABLE: Record<EngineName, boolean> = {
  claude: false,
  chatgpt: false,
  perplexity: true,
  gemini: false,
}

function groundedEngineEnabled(engine: EngineName): boolean {
  const raw = process.env.AEO_GROUNDED_ENGINES?.trim()
  if (!raw) return engine === "perplexity"
  const enabled = new Set(
    raw.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean)
  )
  return enabled.has(engine)
}

// -----------------------------------------------------------------------------
// Helper: shared probe via Vercel AI Gateway (or direct provider when
// AI_PROVIDER=direct + the provider's direct key is set).
// -----------------------------------------------------------------------------
async function probeViaGateway(
  engineName: EngineResponse["engine"],
  gatewayModel: string,
  modelLabel: string,
  prompt: string,
  /** Optional direct-API call. Returns null if its provider key isn't set. */
  directFallback?: () => Promise<EngineResponse | null>
): Promise<EngineResponse | null> {
  const hasGateway = !!process.env.AI_GATEWAY_API_KEY

  // PREFER the direct API path when the provider's direct key is present —
  // this routes calls through the user's own provider credit (e.g., their
  // Anthropic console balance) instead of burning Vercel AI Gateway credits.
  // directFallback() returns null when its key isn't set, falling through to
  // the Gateway path below.
  if (directFallback) {
    const direct = await directFallback()
    if (direct !== null) return direct
  }

  // Fallback: Gateway. Skip silently if no Gateway key either.
  if (!hasGateway) return null

  try {
    const { text } = await generateText({
      model: gatewayModel,
      prompt,
      maxOutputTokens: 1024,
    })
    return { engine: engineName, content: text ?? "", model: modelLabel, searchCapable: ENGINE_SEARCH_CAPABLE[engineName] }
  } catch (err) {
    return {
      engine: engineName,
      content: "",
      model: modelLabel,
      searchCapable: ENGINE_SEARCH_CAPABLE[engineName],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// -----------------------------------------------------------------------------
// Claude — prefers DIRECT Anthropic API when ANTHROPIC_API_KEY is set (so the
// user's own Anthropic credit is consumed, not Vercel AI Gateway credit),
// falls back to Gateway when only AI_GATEWAY_API_KEY is present.
// -----------------------------------------------------------------------------
export async function queryClaude(prompt: string): Promise<EngineResponse | null> {
  return probeViaGateway(
    "claude",
    "anthropic/claude-sonnet-5",
    "claude-sonnet-5",
    prompt,
    groundedEngineEnabled("claude") ? () => queryClaudeDirect(prompt) : undefined
  )
}

/** Direct Anthropic API call — uses ANTHROPIC_API_KEY (the user's own
 *  Anthropic console credit). Haiku 4.5 is the cheapest current model. */
async function queryClaudeDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const model = process.env.AEO_CLAUDE_MODEL || "claude-sonnet-5"
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3,
          },
        ],
      }),
    })
    if (!res.ok) {
      return { engine: "claude", content: "", model, searchCapable: true, error: `HTTP ${res.status}: ${await res.text()}` }
    }

    const data = await res.json()
    const blocks = Array.isArray(data?.content) ? data.content : []
    const textBlocks = blocks.filter((b: any) => b?.type === "text" && typeof b?.text === "string")
    const content = textBlocks.map((b: any) => b.text).join("\n").trim()
    const citations: string[] = Array.from(new Set<string>(
      textBlocks.flatMap((b: any): string[] =>
        Array.isArray(b?.citations)
          ? b.citations
              .map((citation: any) => citation?.url)
              .filter((url: unknown): url is string => typeof url === "string")
          : []
      )
    ))
    const searchQueries: string[] = Array.from(new Set<string>(
      blocks
        .filter((b: any) => b?.type === "server_tool_use" && b?.name === "web_search")
        .map((b: any) => b?.input?.query)
        .filter((query: unknown): query is string => typeof query === "string")
    ))
    const sourceUrls: string[] = Array.from(new Set<string>(
      blocks.flatMap((b: any): string[] =>
        b?.type === "web_search_tool_result" && Array.isArray(b?.content)
          ? b.content
              .map((result: any) => result?.url)
              .filter((url: unknown): url is string => typeof url === "string")
          : []
      )
    ))

    return {
      engine: "claude",
      content,
      model,
      searchCapable: true,
      citations,
      searchQueries,
      sourceUrls,
    }
  } catch (err) {
    return { engine: "claude", content: "", model, searchCapable: true, error: err instanceof Error ? err.message : String(err) }
  }
}

// -----------------------------------------------------------------------------
// ChatGPT — direct OpenAI when OPENAI_API_KEY is set, Gateway otherwise.
// -----------------------------------------------------------------------------
export async function queryChatGPT(prompt: string): Promise<EngineResponse | null> {
  return probeViaGateway(
    "chatgpt",
    "openai/gpt-5.6-luna",
    "gpt-5.6-luna",
    prompt,
    groundedEngineEnabled("chatgpt") ? () => queryChatGPTDirect(prompt) : undefined
  )
}

async function queryChatGPTDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const model = process.env.AEO_OPENAI_MODEL || "gpt-5.6-luna"
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        input: prompt,
        store: false,
        max_output_tokens: 1024,
        tools: [{ type: "web_search", search_context_size: "low" }],
      }),
    })
    if (!res.ok) {
      return { engine: "chatgpt", content: "", model, searchCapable: true, error: `HTTP ${res.status}: ${await res.text()}` }
    }

    const data = await res.json()
    const output = Array.isArray(data?.output) ? data.output : []
    const textParts = output.flatMap((item: any) =>
      item?.type === "message" && Array.isArray(item?.content)
        ? item.content.filter((part: any) => part?.type === "output_text")
        : []
    )
    const content = textParts.map((part: any) => part?.text).filter(Boolean).join("\n").trim()
    const citations: string[] = Array.from(new Set<string>(
      textParts.flatMap((part: any): string[] =>
        Array.isArray(part?.annotations)
          ? part.annotations
              .filter((annotation: any) => annotation?.type === "url_citation")
              .map((annotation: any) => annotation?.url)
              .filter((url: unknown): url is string => typeof url === "string")
          : []
      )
    ))
    const webCalls = output.filter((item: any) => item?.type === "web_search_call")
    const searchQueries: string[] = Array.from(new Set<string>(
      webCalls.flatMap((call: any): string[] => {
        const queries = call?.action?.queries
        if (Array.isArray(queries)) {
          return queries.filter((q: unknown): q is string => typeof q === "string")
        }
        const query = call?.action?.query
        return typeof query === "string" ? [query] : []
      })
    ))
    const sourceUrls: string[] = Array.from(new Set<string>(
      webCalls.flatMap((call: any): string[] =>
        Array.isArray(call?.action?.sources)
          ? call.action.sources
              .map((source: any) => source?.url)
              .filter((url: unknown): url is string => typeof url === "string")
          : []
      )
    ))

    return {
      engine: "chatgpt",
      content,
      model,
      searchCapable: true,
      citations,
      searchQueries,
      sourceUrls,
    }
  } catch (err) {
    return { engine: "chatgpt", content: "", model, searchCapable: true, error: err instanceof Error ? err.message : String(err) }
  }
}

// -----------------------------------------------------------------------------
// Perplexity — direct API when PERPLEXITY_API_KEY is set, Gateway otherwise.
// Perplexity is uniquely valuable because Sonar performs live web search
// and cites URLs inline.
// -----------------------------------------------------------------------------
export async function queryPerplexity(prompt: string): Promise<EngineResponse | null> {
  return probeViaGateway(
    "perplexity",
    "perplexity/sonar",
    "sonar",
    prompt,
    () => queryPerplexityDirect(prompt)
  )
}

async function queryPerplexityDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.PERPLEXITY_API_KEY
  if (!key) return null

  const model = "sonar"
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    })
    if (!res.ok) {
      return { engine: "perplexity", content: "", model, searchCapable: true, error: `HTTP ${res.status}: ${await res.text()}` }
    }
    const data = await res.json()
    // Sonar returns citations as a separate field. Keep them separate so the
    // classifier can record a structured citation as its own signal instead
    // of finding it as text pasted onto the answer.
    const content = data?.choices?.[0]?.message?.content ?? ""
    const citations = Array.isArray(data?.citations)
      ? data.citations.filter((c: unknown): c is string => typeof c === "string")
      : []
    return { engine: "perplexity", content, model, searchCapable: true, citations, sourceUrls: citations }
  } catch (err) {
    return { engine: "perplexity", content: "", model, searchCapable: true, error: err instanceof Error ? err.message : String(err) }
  }
}

// -----------------------------------------------------------------------------
// Gemini — routed the same way the rest of the site's AI tools route
// -----------------------------------------------------------------------------
// Mirrors src/app/api/chat/route.ts: defaults to Vercel AI Gateway (which uses
// AI_GATEWAY_API_KEY and pulls from Vercel credits), and switches to direct
// Google API only if AI_PROVIDER=direct is set (with GOOGLE_GENERATIVE_AI_API_KEY).
//
// Why: the direct Google API can have project-specific quota issues
// (limit: 0 errors even on free-tier models). Going through Gateway uses the
// same path that already works for the production chat tools, with predictable
// billing on Vercel rather than Google's free-tier quirks.
//
// Cost on Gateway: ~$0.003 per probe × 25 prompts × 4 weekly runs ≈ $0.30/mo.
export async function queryGemini(prompt: string): Promise<EngineResponse | null> {
  const directKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const hasGatewayKey = !!process.env.AI_GATEWAY_API_KEY

  // Prefer direct Gemini when a key exists because Google Search grounding is
  // provider-specific and exposes the actual queries + source URLs.
  if (directKey && groundedEngineEnabled("gemini")) {
    const model = process.env.AEO_GEMINI_MODEL || "gemini-3.8-flash"
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": directKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }],
            generationConfig: { maxOutputTokens: 1024 },
          }),
        }
      )
      if (!res.ok) {
        return { engine: "gemini", content: "", model, searchCapable: true, error: `HTTP ${res.status}: ${await res.text()}` }
      }

      const data = await res.json()
      const candidate = data?.candidates?.[0]
      const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []
      const content = parts.map((part: any) => part?.text).filter((text: unknown): text is string => typeof text === "string").join("\n").trim()
      const metadata = candidate?.groundingMetadata ?? {}
      const searchQueries = Array.isArray(metadata?.webSearchQueries)
        ? metadata.webSearchQueries.filter((q: unknown): q is string => typeof q === "string")
        : []
      const sourceUrls = Array.isArray(metadata?.groundingChunks)
        ? metadata.groundingChunks
            .map((chunk: any) => chunk?.web?.uri)
            .filter((url: unknown): url is string => typeof url === "string")
        : []

      return {
        engine: "gemini",
        content,
        model,
        searchCapable: true,
        citations: Array.from(new Set(sourceUrls)),
        searchQueries: Array.from(new Set(searchQueries)),
        sourceUrls: Array.from(new Set(sourceUrls)),
      }
    } catch (err) {
      return {
        engine: "gemini",
        content: "",
        model,
        searchCapable: true,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  // Gateway-only fallback remains a non-search memory probe and is labelled as such.
  if (!hasGatewayKey) return null
  const model = "google/gemini-3.8-flash"
  try {
    const { text } = await generateText({ model, prompt, maxOutputTokens: 1024 })
    return { engine: "gemini", content: text ?? "", model: "gemini-3.8-flash", searchCapable: false }
  } catch (err) {
    return {
      engine: "gemini",
      content: "",
      model: "gemini-2.5-flash",
      searchCapable: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/** Returns only engines that have a usable credential path (direct OR
 *  Gateway). With AI_GATEWAY_API_KEY set, every engine is usable; with
 *  individual provider keys set (ANTHROPIC_API_KEY etc.), those engines
 *  are usable via direct API. */
export function enabledEngines(): Array<(prompt: string) => Promise<EngineResponse | null>> {
  const hasGateway = !!process.env.AI_GATEWAY_API_KEY
  const all: Array<{ fn: (p: string) => Promise<EngineResponse | null>; enabled: boolean }> = [
    { fn: queryClaude, enabled: hasGateway || !!process.env.ANTHROPIC_API_KEY },
    { fn: queryChatGPT, enabled: hasGateway || !!process.env.OPENAI_API_KEY },
    { fn: queryPerplexity, enabled: hasGateway || !!process.env.PERPLEXITY_API_KEY },
    {
      fn: queryGemini,
      enabled:
        hasGateway ||
        !!process.env.GOOGLE_GENAI_API_KEY ||
        !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
  ]
  return all.filter((e) => e.enabled).map((e) => e.fn)
}


export type EngineProbeMode = "grounded-search" | "model-memory" | "disabled"

export interface EngineReadiness {
  engine: EngineName
  mode: EngineProbeMode
  note: string
}

export function engineReadiness(): EngineReadiness[] {
  const hasGateway = !!process.env.AI_GATEWAY_API_KEY
  const directKeys: Record<EngineName, boolean> = {
    claude: !!process.env.ANTHROPIC_API_KEY,
    chatgpt: !!process.env.OPENAI_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    gemini:
      !!process.env.GOOGLE_GENAI_API_KEY ||
      !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }

  return (["claude", "chatgpt", "perplexity", "gemini"] as EngineName[]).map((engine) => {
    const grounded =
      engine === "perplexity"
        ? directKeys.perplexity || hasGateway
        : directKeys[engine] && groundedEngineEnabled(engine)

    if (grounded) {
      return {
        engine,
        mode: "grounded-search",
        note:
          engine === "perplexity"
            ? "Search-backed probe is available."
            : "Direct provider key is present and this engine is opted into AEO_GROUNDED_ENGINES.",
      }
    }

    if (hasGateway || directKeys[engine]) {
      return {
        engine,
        mode: "model-memory",
        note:
          engine === "perplexity"
            ? "Credential path exists but search probe is not currently available."
            : "Probe can run, but live search is not opted in; results measure model memory rather than search visibility.",
      }
    }

    return {
      engine,
      mode: "disabled",
      note: "No usable provider or AI Gateway credential is configured.",
    }
  })
}
