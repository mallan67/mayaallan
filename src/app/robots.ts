import type { MetadataRoute } from "next"

// =============================================================================
// robots.txt — explicit allowances for search + AI crawlers.
// =============================================================================
// We explicitly allow every major AI crawler because some sites accidentally
// block them via overly-restrictive defaults, and because being explicit
// signals intent to AI engines that some heuristics consider.
//
// AI CRAWLERS WE ALLOW (each one feeds a different AI product):
//   GPTBot         — OpenAI's training + ChatGPT search crawler
//   ChatGPT-User   — OpenAI's browsing crawler (fetched when a ChatGPT user
//                    asks it to read a page)
//   OAI-SearchBot  — OpenAI's dedicated search index
//   ClaudeBot      — Anthropic's training crawler (Claude.ai)
//   Claude-Web     — Anthropic's browsing crawler
//   anthropic-ai   — Legacy Anthropic crawler name
//   PerplexityBot  — Perplexity search index
//   Perplexity-User — Perplexity's per-query fetch
//   Google-Extended — Opts Google's Gemini into using your pages for training
//                    + AI Overviews. Without this, Google can index but can't
//                    cite you in AI answers.
//   GoogleOther    — Google's secondary research crawler
//   Applebot-Extended — Apple Intelligence + Siri training
//   Bytespider     — TikTok / ByteDance AI
//   CCBot          — Common Crawl (feeds many open-source LLMs)
//   YouBot         — You.com search
//   meta-externalagent — Meta AI
//   FacebookBot    — Meta link previews + AI
//   Diffbot        — Used by many enterprise AI tools
//   omgili         — Webz.io (feeds many news/research AIs)
//   Amazonbot      — Amazon's Alexa+ training crawler
//
// SEARCH ENGINE CRAWLERS:
//   Googlebot, Bingbot, DuckDuckBot, YandexBot, Slurp (Yahoo),
//   Baiduspider, Sogou web spider, MJ12bot (Majestic), AhrefsBot, SemrushBot
//
// We BLOCK admin/API/download routes from all crawlers (auth-required or
// transactional — no SEO value).
// =============================================================================

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "YouBot",
  "meta-externalagent",
  "FacebookBot",
  "Diffbot",
  "omgili",
  "Amazonbot",
]

const SEARCH_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Slurp",
  "Baiduspider",
  "Sogou web spider",
  "MJ12bot",
  "AhrefsBot",
  "SemrushBot",
  "Applebot",
]

const DISALLOWED_PATHS = ["/admin/", "/api/", "/download/"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule — anything not matching a more specific entry below.
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      // Explicit AI crawler permissions. Same allow/disallow as default but
      // signals intent and protects against future tightening of defaults.
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
      // Search crawlers — explicit so the per-bot allow rules sit alongside
      // the AI bots, which makes the file readable + lets you tighten any one
      // bot in isolation later.
      ...SEARCH_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: "https://www.mayaallan.com/sitemap.xml",
    host: "https://www.mayaallan.com",
  }
}
