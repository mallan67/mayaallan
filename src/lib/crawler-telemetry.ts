import { Redis } from "@upstash/redis"

export type CrawlerName =
  | "googlebot"
  | "bingbot"
  | "oai-searchbot"
  | "chatgpt-user"
  | "gptbot"
  | "claudebot"
  | "claude-user"
  | "perplexitybot"
  | "perplexity-user"
  | "other-ai-bot"

const PATTERNS: Array<[CrawlerName, RegExp]> = [
  ["oai-searchbot", /OAI-SearchBot/i],
  ["chatgpt-user", /ChatGPT-User/i],
  ["gptbot", /GPTBot/i],
  ["claude-user", /Claude-User/i],
  ["claudebot", /ClaudeBot/i],
  ["perplexity-user", /Perplexity-User/i],
  ["perplexitybot", /PerplexityBot/i],
  ["googlebot", /Googlebot/i],
  ["bingbot", /bingbot/i],
]

export function detectCrawler(userAgent: string | null): CrawlerName | null {
  if (!userAgent) return null
  for (const [name, pattern] of PATTERNS) {
    if (pattern.test(userAgent)) return name
  }
  if (/bot|crawler|spider/i.test(userAgent) && /openai|anthropic|claude|perplexity|ai/i.test(userAgent)) {
    return "other-ai-bot"
  }
  return null
}

function redisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export async function recordCrawlerHit(name: CrawlerName, pathname: string): Promise<void> {
  const redis = redisClient()
  if (!redis) return

  const safePath = pathname.split("?")[0].slice(0, 240) || "/"
  const key = `crawler:daily:${dayKey()}`
  try {
    await redis.hincrby(key, `${name}|${safePath}`, 1)
    await redis.expire(key, 60 * 60 * 24 * 60)
  } catch {
    // Telemetry must never affect page delivery.
  }
}

export interface CrawlerSummary {
  name: string
  hits: number
  paths: Array<{ path: string; hits: number }>
}

export async function loadCrawlerSummary(days = 14): Promise<CrawlerSummary[]> {
  const redis = redisClient()
  if (!redis) return []

  const counts = new Map<string, Map<string, number>>()
  for (let offset = 0; offset < days; offset++) {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - offset)
    let rows: Record<string, unknown> | null = null
    try {
      rows = await redis.hgetall<Record<string, unknown>>(`crawler:daily:${dayKey(date)}`)
    } catch {
      continue
    }
    if (!rows) continue

    for (const [field, raw] of Object.entries(rows)) {
      const separator = field.indexOf("|")
      if (separator < 1) continue
      const name = field.slice(0, separator)
      const path = field.slice(separator + 1)
      const n = Number(raw) || 0
      const paths = counts.get(name) ?? new Map<string, number>()
      paths.set(path, (paths.get(path) ?? 0) + n)
      counts.set(name, paths)
    }
  }

  return Array.from(counts.entries())
    .map(([name, paths]) => ({
      name,
      hits: Array.from(paths.values()).reduce((sum, n) => sum + n, 0),
      paths: Array.from(paths.entries())
        .map(([path, hits]) => ({ path, hits }))
        .sort((a, b) => b.hits - a.hits || a.path.localeCompare(b.path))
        .slice(0, 10),
    }))
    .sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name))
}
