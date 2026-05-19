import fs from "node:fs/promises"
import path from "node:path"

// =============================================================================
// FAQ loader — reads content/faq.json (single source of truth).
// =============================================================================
// Why JSON not markdown: each answer is short and structured, and the same
// data drives both the rendered page AND the FAQPage JSON-LD schema. JSON
// avoids markdown-parsing for the schema serialization.
// =============================================================================

export interface FaqCategory {
  id: string
  label: string
}

export interface FaqQuestion {
  id: string
  category: string
  question: string
  answer: string
  /** Optional: link to a deeper scenario / book page that expands on this answer. */
  relatedUrl?: string
}

export interface FaqData {
  title: string
  /** Optional short version of title — used as the visible H1 / breadcrumb when set. */
  shortTitle?: string
  /** Optional tagline displayed under the H1 (sub-headline above the lead paragraph). */
  tagline?: string
  description: string
  categories: FaqCategory[]
  questions: FaqQuestion[]
}

const FAQ_FILE = path.join(process.cwd(), "content", "faq.json")

export async function loadFaq(): Promise<FaqData> {
  const raw = await fs.readFile(FAQ_FILE, "utf8")
  const parsed = JSON.parse(raw)
  return {
    title: String(parsed.title ?? "Frequently Asked Questions"),
    shortTitle: parsed.shortTitle ? String(parsed.shortTitle) : undefined,
    tagline: parsed.tagline ? String(parsed.tagline) : undefined,
    description: String(parsed.description ?? ""),
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
  }
}

/** Group questions by category, preserving the category order from faq.json. */
export function groupByCategory(faq: FaqData): Array<{ category: FaqCategory; items: FaqQuestion[] }> {
  return faq.categories.map((category) => ({
    category,
    items: faq.questions.filter((q) => q.category === category.id),
  }))
}
