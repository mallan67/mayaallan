export type CrawlerKind =
  | "openai-search"
  | "openai-training"
  | "openai-user"
  | "anthropic"
  | "perplexity"
  | "google"
  | "bing"
  | "other-ai"

export interface CrawlerMatch {
  name: string
  kind: CrawlerKind
}

const RULES: Array<{ re: RegExp; match: CrawlerMatch }> = [
  { re: /OAI-SearchBot/i, match: { name: "OAI-SearchBot", kind: "openai-search" } },
  { re: /GPTBot/i, match: { name: "GPTBot", kind: "openai-training" } },
  { re: /ChatGPT-User/i, match: { name: "ChatGPT-User", kind: "openai-user" } },
  { re: /ClaudeBot|Claude-Web/i, match: { name: "ClaudeBot", kind: "anthropic" } },
  { re: /PerplexityBot|Perplexity-User/i, match: { name: "Perplexity", kind: "perplexity" } },
  { re: /Googlebot/i, match: { name: "Googlebot", kind: "google" } },
  { re: /bingbot/i, match: { name: "Bingbot", kind: "bing" } },
  { re: /Bytespider|CCBot/i, match: { name: "Other AI crawler", kind: "other-ai" } },
]

export function identifyCrawler(userAgent: string | null | undefined): CrawlerMatch | null {
  if (!userAgent) return null
  for (const rule of RULES) {
    if (rule.re.test(userAgent)) return rule.match
  }
  return null
}
