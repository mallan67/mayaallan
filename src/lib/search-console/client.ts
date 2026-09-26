import "server-only"
import { createSign } from "node:crypto"

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

export interface SearchAnalyticsRow {
  keys?: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface SearchAnalyticsRequest {
  startDate: string
  endDate: string
  dimensions?: Array<"date" | "query" | "page" | "country" | "device" | "searchAppearance">
  type?: "web" | "image" | "video" | "news" | "discover" | "googleNews"
  rowLimit?: number
  startRow?: number
  dataState?: "final" | "all"
  dimensionFilterGroups?: unknown[]
}

let tokenCache: { token: string; expiresAt: number } | null = null

function base64Url(value: string | Buffer): string {
  const input = typeof value === "string" ? Buffer.from(value, "utf8") : value
  return input.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function serviceAccountConfig(): { email: string; privateKey: string } | null {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim()
  const rawKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim()
  if (!email || !rawKey) return null
  return { email, privateKey: rawKey.replace(/\\n/g, "\n") }
}

export function searchConsoleSiteUrl(): string {
  return process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || "sc-domain:mayaallan.com"
}

export function isSearchConsoleConfigured(): boolean {
  return serviceAccountConfig() !== null
}

async function accessToken(): Promise<string> {
  const nowMs = Date.now()
  if (tokenCache && tokenCache.expiresAt - nowMs > 60_000) return tokenCache.token

  const config = serviceAccountConfig()
  if (!config) {
    throw new Error(
      "Search Console API is not configured. Set GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY.",
    )
  }

  const now = Math.floor(nowMs / 1000)
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claims = base64Url(
    JSON.stringify({
      iss: config.email,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    }),
  )
  const unsigned = `${header}.${claims}`
  const signer = createSign("RSA-SHA256")
  signer.update(unsigned)
  signer.end()
  const assertion = `${unsigned}.${base64Url(signer.sign(config.privateKey))}`

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Google OAuth token exchange failed: HTTP ${res.status} ${(await res.text()).slice(0, 1000)}`)
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error("Google OAuth token response did not include access_token")

  tokenCache = {
    token: data.access_token,
    expiresAt: nowMs + (data.expires_in ?? 3600) * 1000,
  }
  return tokenCache.token
}

async function googleFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken()
  const headers = new Headers(init.headers)
  headers.set("authorization", `Bearer ${token}`)
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json")
  return fetch(url, { ...init, headers, cache: "no-store" })
}

export async function querySearchAnalytics(request: SearchAnalyticsRequest): Promise<SearchAnalyticsRow[]> {
  const site = encodeURIComponent(searchConsoleSiteUrl())
  const res = await googleFetch(
    `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify({
        ...request,
        rowLimit: Math.min(Math.max(request.rowLimit ?? 5000, 1), 25_000),
        startRow: Math.max(request.startRow ?? 0, 0),
      }),
    },
  )
  if (!res.ok) {
    throw new Error(`Search Console Search Analytics failed: HTTP ${res.status} ${(await res.text()).slice(0, 1200)}`)
  }
  const data = (await res.json()) as { rows?: SearchAnalyticsRow[] }
  return Array.isArray(data.rows) ? data.rows : []
}

export async function listSearchConsoleSites(): Promise<Array<{ siteUrl: string; permissionLevel: string }>> {
  const res = await googleFetch("https://www.googleapis.com/webmasters/v3/sites")
  if (!res.ok) {
    throw new Error(`Search Console sites.list failed: HTTP ${res.status} ${(await res.text()).slice(0, 1200)}`)
  }
  const data = (await res.json()) as { siteEntry?: Array<{ siteUrl: string; permissionLevel: string }> }
  return Array.isArray(data.siteEntry) ? data.siteEntry : []
}

export async function listSearchConsoleSitemaps(): Promise<unknown[]> {
  const site = encodeURIComponent(searchConsoleSiteUrl())
  const res = await googleFetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps`)
  if (!res.ok) {
    throw new Error(`Search Console sitemaps.list failed: HTTP ${res.status} ${(await res.text()).slice(0, 1200)}`)
  }
  const data = (await res.json()) as { sitemap?: unknown[] }
  return Array.isArray(data.sitemap) ? data.sitemap : []
}

export async function inspectSearchConsoleUrl(inspectionUrl: string): Promise<Record<string, unknown>> {
  const res = await googleFetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    body: JSON.stringify({
      inspectionUrl,
      siteUrl: searchConsoleSiteUrl(),
      languageCode: "en-US",
    }),
  })
  if (!res.ok) {
    throw new Error(`Search Console URL Inspection failed for ${inspectionUrl}: HTTP ${res.status} ${(await res.text()).slice(0, 1200)}`)
  }
  return (await res.json()) as Record<string, unknown>
}
