import "server-only"
import { generateText } from "ai"

// =============================================================================
// AEO engine probes
// =============================================================================
// Direct provider credentials are preferred for AEO because OpenAI, Anthropic,
// Google and Perplexity expose provider-native live web search/citation data.
// When only Vercel AI Gateway is available, non-search providers fall back to a
// plain completion and are explicitly labelled "model-memory". Perplexity Sonar
// remains search-capable through Gateway because search is intrinsic to Sonar.
//
// This distinction is intentional: a model remembering Maya Allan is useful
// brand-memory data, but it is NOT evidence that a live AI search found or cited
// mayaallan.com.
// =============================================================================

export type EngineName = "claude" | "chatgpt" | "perplexity" | "gemini"
export type SearchMode = "grounded-search" | "model-memory"

export interface EngineResponse {
  engine: EngineName
  content: string
  model: string
  searchCapable: boolean
  searchMode: SearchMode
  /** Structured source URLs returned by the provider. */
  citations?: string[]
  /** Search queries exposed by the provider, when available. */
  searchQueries?: string[]
  /** Set if the call failed. content will be empty. */
  error?: string
}

const MAX_OUTPUT_TOKENS = 1024

function envInt(name: string, fallback: number, min = 1, max = 20): number {
  const raw = process.env[name]
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(values.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim()))]
}

function collectDeepStrings(
  value: unknown,
  keys: Set<string>,
  out: string[] = [],
): string[] {
  if (!value || typeof value !== "object") return out
  if (Array.isArray(value)) {
    for (const item of value) collectDeepStrings(item, keys, out)
    return out
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (keys.has(key)) {
      if (typeof child === "string") out.push(child)
      else if (Array.isArray(child)) {
        for (const item of child) if (typeof item === "string") out.push(item)
      }
    }
    collectDeepStrings(child, keys, out)
  }
  return out
}

function collectUrls(value: unknown): string[] {
  return uniqueStrings(
    collectDeepStrings(value, new Set(["url", "uri"])).filter((value) => {
      try {
        const u = new URL(value)
        return u.protocol === "https:" || u.protocol === "http:"
      } catch {
        return false
      }
    }),
  )
}

function collectQueries(value: unknown): string[] {
  return uniqueStrings(collectDeepStrings(value, new Set(["query", "queries", "webSearchQueries"])))
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function groundedPrompt(prompt: string): string {
  return [
    "Search the live web before answering this question. Use current web sources and include source citations when the provider supports them.",
    "Answer the reader's question naturally; do not mention this measurement instruction.",
    "",
    prompt,
  ].join("\n")
}

function hasSearchEvidence(value: unknown): boolean {
  if (!value || typeof value !== "object") return false
  if (Array.isArray(value)) return value.some(hasSearchEvidence)

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase()
    if (
      normalizedKey.includes("groundingmetadata") ||
      normalizedKey.includes("grounding_metadata") ||
      normalizedKey.includes("websearchqueries") ||
      normalizedKey.includes("web_search_queries")
    ) {
      return true
    }
    if (
      (key === "type" || key === "name") &&
      typeof child === "string" &&
      /web[_ -]?search|search_query|search_results?/i.test(child)
    ) {
      return true
    }
    if (hasSearchEvidence(child)) return true
  }
  return false
}


async function responseError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "")
  return `HTTP ${res.status}${text ? `: ${text.slice(0, 1200)}` : ""}`
}

// -----------------------------------------------------------------------------
// Gateway memory/search fallback
// -----------------------------------------------------------------------------

async function probeViaGateway(
  engine: EngineName,
  model: string,
  prompt: string,
  searchCapable: boolean,
): Promise<EngineResponse | null> {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) return null

  try {
    const result = await generateText({
      model,
      prompt: searchCapable ? groundedPrompt(prompt) : prompt,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    })

    const citations = uniqueStrings(
      (result.sources ?? [])
        .filter((source) => source.sourceType === "url")
        .map((source) => source.url),
    )
    const searched =
      searchCapable &&
      (citations.length > 0 || hasSearchEvidence(result.providerMetadata))

    return {
      engine,
      content: result.text ?? "",
      model,
      searchCapable,
      searchMode: searched ? "grounded-search" : "model-memory",
      citations,
      searchQueries: collectQueries(result.providerMetadata),
    }
  } catch (err) {
    return {
      engine,
      content: "",
      model,
      searchCapable,
      searchMode: searchCapable ? "grounded-search" : "model-memory",
      error: errorMessage(err),
    }
  }
}

// -----------------------------------------------------------------------------
// Claude — provider-native web search when ANTHROPIC_API_KEY is configured.
// -----------------------------------------------------------------------------

export async function queryClaude(prompt: string): Promise<EngineResponse | null> {
  const direct = await queryClaudeDirect(prompt)
  if (direct) return direct

  const gatewayModel = process.env.AEO_CLAUDE_GATEWAY_MODEL || "anthropic/claude-haiku-4-5"
  return probeViaGateway("claude", gatewayModel, prompt, false)
}

async function queryClaudeDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const model = process.env.AEO_CLAUDE_MODEL || "claude-haiku-4-5-20251001"
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
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{ role: "user", content: groundedPrompt(prompt) }],
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: envInt("AEO_MAX_SEARCHES_PER_PROBE", 2, 1, 5),
          },
        ],
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      return {
        engine: "claude",
        content: "",
        model,
        searchCapable: true,
        searchMode: "grounded-search",
        error: await responseError(res),
      }
    }

    const data = await res.json()
    const content = Array.isArray(data?.content)
      ? data.content
          .filter((block: unknown) => !!block && typeof block === "object" && (block as { type?: string }).type === "text")
          .map((block: unknown) => String((block as { text?: unknown }).text ?? ""))
          .join("\n")
      : ""

    const searched = hasSearchEvidence(data)
    return {
      engine: "claude",
      content,
      model,
      searchCapable: true,
      searchMode: searched ? "grounded-search" : "model-memory",
      citations: collectUrls(data),
      searchQueries: collectQueries(data),
    }
  } catch (err) {
    return {
      engine: "claude",
      content: "",
      model,
      searchCapable: true,
      searchMode: "grounded-search",
      error: errorMessage(err),
    }
  }
}

// -----------------------------------------------------------------------------
// ChatGPT — Responses API + web_search when OPENAI_API_KEY is configured.
// -----------------------------------------------------------------------------

export async function queryChatGPT(prompt: string): Promise<EngineResponse | null> {
  const direct = await queryChatGPTDirect(prompt)
  if (direct) return direct

  const gatewayModel = process.env.AEO_OPENAI_GATEWAY_MODEL || "openai/gpt-5.6-luna"
  return probeViaGateway("chatgpt", gatewayModel, prompt, false)
}

async function queryChatGPTDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const model = process.env.AEO_OPENAI_MODEL || "gpt-5.6-luna"
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: groundedPrompt(prompt),
        tools: [{ type: "web_search", search_context_size: "low" }],
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      return {
        engine: "chatgpt",
        content: "",
        model,
        searchCapable: true,
        searchMode: "grounded-search",
        error: await responseError(res),
      }
    }

    const data = await res.json()
    const content =
      typeof data?.output_text === "string"
        ? data.output_text
        : Array.isArray(data?.output)
          ? data.output
              .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
              .filter((item: { type?: string }) => item.type === "output_text")
              .map((item: { text?: string }) => item.text ?? "")
              .join("\n")
          : ""

    const searched = hasSearchEvidence(data?.output ?? data)
    return {
      engine: "chatgpt",
      content,
      model,
      searchCapable: true,
      searchMode: searched ? "grounded-search" : "model-memory",
      citations: collectUrls(data?.output ?? data),
      searchQueries: collectQueries(data?.output ?? data),
    }
  } catch (err) {
    return {
      engine: "chatgpt",
      content: "",
      model,
      searchCapable: true,
      searchMode: "grounded-search",
      error: errorMessage(err),
    }
  }
}

// -----------------------------------------------------------------------------
// Perplexity — Sonar performs live search by design.
// -----------------------------------------------------------------------------

export async function queryPerplexity(prompt: string): Promise<EngineResponse | null> {
  const direct = await queryPerplexityDirect(prompt)
  if (direct) return direct

  const gatewayModel = process.env.AEO_PERPLEXITY_GATEWAY_MODEL || "perplexity/sonar"
  return probeViaGateway("perplexity", gatewayModel, prompt, true)
}

async function queryPerplexityDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.PERPLEXITY_API_KEY
  if (!key) return null

  const model = process.env.AEO_PERPLEXITY_MODEL || "sonar"
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: groundedPrompt(prompt) }],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      return {
        engine: "perplexity",
        content: "",
        model,
        searchCapable: true,
        searchMode: "grounded-search",
        error: await responseError(res),
      }
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content ?? ""
    const citations = uniqueStrings([
      ...(Array.isArray(data?.citations) ? data.citations : []),
      ...collectUrls(data?.search_results ?? []),
    ])

    return {
      engine: "perplexity",
      content,
      model,
      searchCapable: true,
      searchMode: "grounded-search",
      citations,
      searchQueries: collectQueries(data),
    }
  } catch (err) {
    return {
      engine: "perplexity",
      content: "",
      model,
      searchCapable: true,
      searchMode: "grounded-search",
      error: errorMessage(err),
    }
  }
}

// -----------------------------------------------------------------------------
// Gemini — direct Gemini REST API + google_search grounding when a Google key
// is configured. Gateway-only fallback remains model-memory because the generic
// generateText call below does not request provider-native Google Search.
// -----------------------------------------------------------------------------

export async function queryGemini(prompt: string): Promise<EngineResponse | null> {
  const direct = await queryGeminiDirect(prompt)
  if (direct) return direct

  const gatewayModel = process.env.AEO_GEMINI_GATEWAY_MODEL || "google/gemini-2.5-flash-lite"
  return probeViaGateway("gemini", gatewayModel, prompt, false)
}

async function queryGeminiDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!key) return null

  const model = process.env.AEO_GEMINI_MODEL || "gemini-2.5-flash-lite"
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: groundedPrompt(prompt) }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      return {
        engine: "gemini",
        content: "",
        model,
        searchCapable: true,
        searchMode: "grounded-search",
        error: await responseError(res),
      }
    }

    const data = await res.json()
    const candidate = data?.candidates?.[0]
    const content = Array.isArray(candidate?.content?.parts)
      ? candidate.content.parts.map((part: { text?: string }) => part.text ?? "").join("\n")
      : ""
    const grounding = candidate?.groundingMetadata ?? candidate?.grounding_metadata ?? {}

    const searched = hasSearchEvidence(grounding)
    return {
      engine: "gemini",
      content,
      model,
      searchCapable: true,
      searchMode: searched ? "grounded-search" : "model-memory",
      citations: collectUrls(grounding),
      searchQueries: uniqueStrings([
        ...(Array.isArray(grounding?.webSearchQueries) ? grounding.webSearchQueries : []),
        ...(Array.isArray(grounding?.web_search_queries) ? grounding.web_search_queries : []),
      ]),
    }
  } catch (err) {
    return {
      engine: "gemini",
      content: "",
      model,
      searchCapable: true,
      searchMode: "grounded-search",
      error: errorMessage(err),
    }
  }
}

/** Returns engines with either direct credentials or a Gateway credential path. */
export function enabledEngines(): Array<(prompt: string) => Promise<EngineResponse | null>> {
  const hasGateway = !!process.env.AI_GATEWAY_API_KEY || !!process.env.VERCEL_OIDC_TOKEN
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

  return all.filter((entry) => entry.enabled).map((entry) => entry.fn)
}
