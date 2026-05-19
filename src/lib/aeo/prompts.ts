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
    return parsed.prompts.filter(
      (p: any): p is AeoPrompt =>
        typeof p?.id === "string" && typeof p?.category === "string" && typeof p?.text === "string"
    )
  } catch (err) {
    console.warn("[aeo] Failed to load prompts:", err)
    return []
  }
}
