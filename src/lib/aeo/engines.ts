import "server-only"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

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

export interface EngineResponse {
  engine: "claude" | "chatgpt" | "perplexity" | "gemini"
  content: string
  model: string
  /** Set if the call failed. content will be empty. */
  error?: string
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
    return { engine: engineName, content: text ?? "", model: modelLabel }
  } catch (err) {
    return {
      engine: engineName,
      content: "",
      model: modelLabel,
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
    "anthropic/claude-haiku-4-5",
    "claude-haiku-4-5",
    prompt,
    () => queryClaudeDirect(prompt)
  )
}

/** Direct Anthropic API call — uses ANTHROPIC_API_KEY (the user's own
 *  Anthropic console credit). Haiku 4.5 is the cheapest current model. */
async function queryClaudeDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const model = "claude-haiku-4-5"
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
      }),
    })
    if (!res.ok) {
      return { engine: "claude", content: "", model, error: `HTTP ${res.status}: ${await res.text()}` }
    }
    const data = await res.json()
    const content = data?.content?.[0]?.text ?? ""
    return { engine: "claude", content, model }
  } catch (err) {
    return { engine: "claude", content: "", model, error: err instanceof Error ? err.message : String(err) }
  }
}

// -----------------------------------------------------------------------------
// ChatGPT — direct OpenAI when OPENAI_API_KEY is set, Gateway otherwise.
// -----------------------------------------------------------------------------
export async function queryChatGPT(prompt: string): Promise<EngineResponse | null> {
  return probeViaGateway(
    "chatgpt",
    "openai/gpt-4o-mini",
    "gpt-4o-mini",
    prompt,
    () => queryChatGPTDirect(prompt)
  )
}

async function queryChatGPTDirect(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const model = "gpt-4o-mini"
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    })
    if (!res.ok) {
      return { engine: "chatgpt", content: "", model, error: `HTTP ${res.status}: ${await res.text()}` }
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content ?? ""
    return { engine: "chatgpt", content, model }
  } catch (err) {
    return { engine: "chatgpt", content: "", model, error: err instanceof Error ? err.message : String(err) }
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
      return { engine: "perplexity", content: "", model, error: `HTTP ${res.status}: ${await res.text()}` }
    }
    const data = await res.json()
    // Sonar returns citations as a separate field — concatenate so the
    // detector sees them alongside the response body.
    const content =
      (data?.choices?.[0]?.message?.content ?? "") +
      (Array.isArray(data?.citations) ? "\n\nCitations:\n" + data.citations.join("\n") : "")
    return { engine: "perplexity", content, model }
  } catch (err) {
    return { engine: "perplexity", content: "", model, error: err instanceof Error ? err.message : String(err) }
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
  const hasGatewayKey = !!process.env.AI_GATEWAY_API_KEY
  const hasDirectKey = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  const provider = (process.env.AI_PROVIDER ?? "gateway").toLowerCase()

  // No usable credentials anywhere — skip silently.
  if (!hasGatewayKey && !hasDirectKey) return null

  // Decide the actual transport: prefer the path that has a key configured,
  // honoring AI_PROVIDER when it's set explicitly.
  const useDirect = provider === "direct" ? hasDirectKey : !hasGatewayKey && hasDirectKey
  const model = useDirect ? google("gemini-2.5-flash") : "google/gemini-2.5-flash"
  const modelLabel = "gemini-2.5-flash"

  try {
    const { text } = await generateText({
      model,
      prompt,
      // maxOutputTokens cap keeps cost predictable; 1024 is enough for AEO
      // citation detection (we only need to see whether the engine mentioned
      // the site, not get a full long-form answer).
      maxOutputTokens: 1024,
    })
    return { engine: "gemini", content: text ?? "", model: modelLabel }
  } catch (err) {
    return {
      engine: "gemini",
      content: "",
      model: modelLabel,
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
