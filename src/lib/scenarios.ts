import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

// =============================================================================
// Scenarios — the AI-citation-optimized landing pages.
// =============================================================================
// One markdown file per scenario in content/scenarios/. The frontmatter is
// intentionally rich because every field feeds JSON-LD (FAQ, HowTo, Article)
// so the page is maximally citable by ChatGPT / Claude / Perplexity / Google
// AI Overviews.
//
// FRONTMATTER FIELDS (required unless marked optional):
//
//   title:           The exact user query this page answers.
//                    Example: "What does ego dissolution feel like?"
//                    This becomes the H1 and the AI's answer headline.
//
//   slug:            URL slug. (Optional — derived from filename if omitted.)
//
//   shortAnswer:     1-2 sentence direct answer. THE SINGLE MOST IMPORTANT
//                    FIELD — this is what AI engines quote verbatim. Make it
//                    self-contained: a person reading just this sentence
//                    should walk away with a real answer.
//
//   description:     Meta description (150-160 chars). For Google SERP snippet.
//
//   keywords:        Array of semantic keyword variations.
//
//   datePublished:   ISO date.
//   dateModified:    ISO date. Optional — bump when you edit substantively
//                    to signal freshness to Google.
//
//   bookExcerpt:     Optional book chapter/scenario this is adapted from.
//
//   navigation:      Optional array of "what to do" steps. Each step becomes
//                    a HowTo schema step + renders as a numbered list.
//                    Steps should be ACTIONABLE.
//
//   faqs:            Optional array of related Q&A. Becomes FAQPage schema +
//                    accordion at bottom of page. Aim for 4-8 questions
//                    that match real searches.
//
//   category:        One of: preparation, journey, integration, safety,
//                    practitioners. Used for cross-linking related scenarios.
//
//   tags:            Free-form tags for filtering.
// =============================================================================

export type ScenarioCategory = "preparation" | "journey" | "integration" | "safety" | "practitioners"

export interface ScenarioFAQ {
  question: string
  answer: string
}

export interface ScenarioStep {
  name: string
  text: string
}

export interface ScenarioFrontmatter {
  title: string
  shortAnswer: string
  description: string
  keywords?: string[]
  datePublished: string
  dateModified?: string
  bookExcerpt?: string
  navigation?: ScenarioStep[]
  faqs?: ScenarioFAQ[]
  category: ScenarioCategory
  tags?: string[]
}

export type ScenarioSummary = ScenarioFrontmatter & {
  slug: string
}

export type ScenarioFull = ScenarioSummary & {
  body: string
}

const SCENARIOS_DIR = path.join(process.cwd(), "content", "scenarios")

function slugFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.md$/, "")
  // Strip optional numeric prefix like "01-" so files can be ordered without
  // exposing the number in URLs.
  return withoutExt.replace(/^\d+-/, "")
}

function parseFrontmatter(data: Record<string, unknown>, slug: string): ScenarioFrontmatter & { slug: string } {
  // Defensive parsing — frontmatter values come from human-edited markdown,
  // so we tolerate missing optional fields but require the core ones.
  const title = String(data.title ?? "Untitled scenario")
  const shortAnswer = String(data.shortAnswer ?? "")
  if (!shortAnswer) {
    console.warn(`[scenarios] Missing shortAnswer in ${slug}.md — AI engines won't have a clean quote.`)
  }
  return {
    slug,
    title,
    shortAnswer,
    description: String(data.description ?? shortAnswer.slice(0, 160)),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : undefined,
    datePublished: String(data.datePublished ?? new Date().toISOString().slice(0, 10)),
    dateModified: data.dateModified ? String(data.dateModified) : undefined,
    bookExcerpt: data.bookExcerpt ? String(data.bookExcerpt) : undefined,
    navigation: Array.isArray(data.navigation)
      ? data.navigation.map((s: any) => ({ name: String(s.name ?? ""), text: String(s.text ?? "") }))
      : undefined,
    faqs: Array.isArray(data.faqs)
      ? data.faqs.map((f: any) => ({ question: String(f.question ?? ""), answer: String(f.answer ?? "") }))
      : undefined,
    category: (["preparation", "journey", "integration", "safety", "practitioners"].includes(String(data.category))
      ? String(data.category)
      : "integration") as ScenarioCategory,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
  }
}

export async function listScenarios(): Promise<ScenarioSummary[]> {
  let files: string[]
  try {
    files = await fs.readdir(SCENARIOS_DIR)
  } catch {
    return []
  }
  const mdFiles = files.filter((f) => f.endsWith(".md"))

  const summaries: ScenarioSummary[] = []
  for (const file of mdFiles) {
    const full = await fs.readFile(path.join(SCENARIOS_DIR, file), "utf8")
    const { data } = matter(full)
    summaries.push(parseFrontmatter(data, slugFromFilename(file)))
  }

  // Sort by date, newest first. If you'd rather sort by filename prefix to keep
  // book-order, swap this for: summaries.sort((a, b) => a.slug.localeCompare(b.slug))
  summaries.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
  return summaries
}

export async function getScenario(slug: string): Promise<ScenarioFull | null> {
  let files: string[]
  try {
    files = await fs.readdir(SCENARIOS_DIR)
  } catch {
    return null
  }
  const match = files.find((f) => f.endsWith(".md") && slugFromFilename(f) === slug)
  if (!match) return null

  const full = await fs.readFile(path.join(SCENARIOS_DIR, match), "utf8")
  const { data, content } = matter(full)
  return {
    ...parseFrontmatter(data, slug),
    body: content,
  }
}

export async function listScenariosByCategory(category: ScenarioCategory): Promise<ScenarioSummary[]> {
  const all = await listScenarios()
  return all.filter((s) => s.category === category)
}
