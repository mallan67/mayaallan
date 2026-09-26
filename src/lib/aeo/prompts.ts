import fs from "node:fs/promises"
import path from "node:path"

// =============================================================================
// AEO prompt loader.
// =============================================================================
// Reads content/aeo-prompts.json — the source-of-truth list of reader-intent
// queries we probe AI engines with weekly. Edit the JSON file to add or
// remove prompts; this loader picks up changes automatically on next cron run.
// =============================================================================

export interface AeoPrompt {
  id: string
  category: string
  text: string
  /** Reader-intent lens used for reporting (discovery/problem/tool/research/etc.). */
  intent?: string
  /** Stable topic cluster so related prompts can be compared over time. */
  topic?: string
  /** Maya URL we would most want a grounded engine to choose for this query. */
  target_path?: string
}

const PROMPTS_FILE = path.join(process.cwd(), "content", "aeo-prompts.json")

export async function loadPrompts(): Promise<AeoPrompt[]> {
  try {
    const raw = await fs.readFile(PROMPTS_FILE, "utf8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.prompts)) {
      console.warn("[aeo] aeo-prompts.json missing 'prompts' array")
      return []
    }
    return parsed.prompts.filter((value: unknown): value is AeoPrompt => {
      if (!value || typeof value !== "object") return false
      const p = value as Record<string, unknown>
      return (
        typeof p.id === "string" &&
        typeof p.category === "string" &&
        typeof p.text === "string" &&
        (p.intent === undefined || typeof p.intent === "string") &&
        (p.topic === undefined || typeof p.topic === "string") &&
        (p.target_path === undefined || typeof p.target_path === "string")
      )
    })
  } catch (err) {
    console.warn("[aeo] Failed to load prompts:", err)
    return []
  }
}
