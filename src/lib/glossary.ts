import fs from "node:fs/promises"
import path from "node:path"

// =============================================================================
// Glossary loader — reads content/glossary.json (single source of truth).
// =============================================================================
// The glossary is the canonical answer page for "what is X" queries in the
// psilocybin / integration space. Each term renders with a deep-link anchor
// (so AI engines and humans can link to a specific definition), and the
// whole set is wrapped in schema.org DefinedTermSet so AI engines and Google
// recognize this as an authoritative reference.
//
// IMPORTANT: definitions are intentionally GENERAL — drawn from established
// scientific and cultural literature about psychedelics, not from Maya's
// book. Maya's specific working method for each concept lives in the book;
// the glossary points there for depth.
// =============================================================================

export interface GlossaryCategory {
  id: string
  label: string
}

export interface GlossaryTerm {
  id: string
  term: string
  /** Synonyms / alternative spellings. Emitted as schema.org `alternateName`. */
  alternateNames?: string[]
  category: string
  /** 50-120 word standalone definition. AI engines quote this verbatim. */
  definition: string
  /** Cross-link to other glossary entries by id — renders as inline links. */
  relatedTerms?: string[]
  /** Cross-link to scenario pages by slug — only links if scenario is published. */
  relatedScenarios?: string[]
}

export interface GlossaryData {
  title: string
  shortTitle?: string
  tagline?: string
  description: string
  categories: GlossaryCategory[]
  terms: GlossaryTerm[]
}

const GLOSSARY_FILE = path.join(process.cwd(), "content", "glossary.json")

export async function loadGlossary(): Promise<GlossaryData> {
  const raw = await fs.readFile(GLOSSARY_FILE, "utf8")
  const parsed = JSON.parse(raw)
  return {
    title: String(parsed.title ?? "Glossary"),
    shortTitle: parsed.shortTitle ? String(parsed.shortTitle) : undefined,
    tagline: parsed.tagline ? String(parsed.tagline) : undefined,
    description: String(parsed.description ?? ""),
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    terms: Array.isArray(parsed.terms) ? parsed.terms : [],
  }
}

/** Group terms by category, preserving the category order from the JSON. */
export function groupTermsByCategory(
  data: GlossaryData
): Array<{ category: GlossaryCategory; items: GlossaryTerm[] }> {
  return data.categories.map((category) => ({
    category,
    items: data.terms.filter((t) => t.category === category.id),
  }))
}
