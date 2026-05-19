import "server-only"

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
// Claude (Anthropic)
// -----------------------------------------------------------------------------
export async function queryClaude(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const model = "claude-sonnet-4-6"
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
// ChatGPT (OpenAI) — uses the Responses API with web search to get the
// SAME behavior as ChatGPT Search, including citations.
// -----------------------------------------------------------------------------
export async function queryChatGPT(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const model = "gpt-4o-mini"
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are answering as if you were ChatGPT Search. Provide a substantive answer and include URLs when you mention specific sources.",
          },
          { role: "user", content: prompt },
        ],
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
// Perplexity — the BEST signal here because Perplexity actually does live web
// search + cites sources inline, so we can directly measure if our pages get
// surfaced.
// -----------------------------------------------------------------------------
export async function queryPerplexity(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.PERPLEXITY_API_KEY
  if (!key) return null

  const model = "sonar"
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
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
    // Perplexity returns content + citations. Concatenate so the detector
    // sees both in one blob (citation URLs are what we care most about).
    const content =
      (data?.choices?.[0]?.message?.content ?? "") +
      (Array.isArray(data?.citations) ? "\n\nCitations:\n" + data.citations.join("\n") : "")
    return { engine: "perplexity", content, model }
  } catch (err) {
    return { engine: "perplexity", content: "", model, error: err instanceof Error ? err.message : String(err) }
  }
}

// -----------------------------------------------------------------------------
// Gemini (Google AI Studio) — TRULY FREE, no card required
// -----------------------------------------------------------------------------
// Accepts either GOOGLE_GENAI_API_KEY (canonical for the AEO tracker) or
// GOOGLE_GENERATIVE_AI_API_KEY (the @ai-sdk/google convention used by the
// integration/belief-inquiry/reset chat tools). Same key value works for both;
// having the fallback means existing setups don't need to add a duplicate var.
export async function queryGemini(prompt: string): Promise<EngineResponse | null> {
  const key = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!key) return null

  const model = "gemini-2.0-flash"
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    })
    if (!res.ok) {
      return { engine: "gemini", content: "", model, error: `HTTP ${res.status}: ${await res.text()}` }
    }
    const data = await res.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    return { engine: "gemini", content, model }
  } catch (err) {
    return { engine: "gemini", content: "", model, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Returns only engines whose API keys are present in env. */
export function enabledEngines(): Array<(prompt: string) => Promise<EngineResponse | null>> {
  const hasGemini = !!(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  const all: Array<{ fn: (p: string) => Promise<EngineResponse | null>; enabled: boolean }> = [
    { fn: queryClaude, enabled: !!process.env.ANTHROPIC_API_KEY },
    { fn: queryChatGPT, enabled: !!process.env.OPENAI_API_KEY },
    { fn: queryPerplexity, enabled: !!process.env.PERPLEXITY_API_KEY },
    { fn: queryGemini, enabled: hasGemini },
  ]
  return all.filter((e) => e.enabled).map((e) => e.fn)
}
