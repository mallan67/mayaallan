import "server-only"
import { createSign } from "node:crypto"

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SEARCH_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"

type CacheEntry = { token: string; expiresAt: number }
let cachedToken: CacheEntry | null = null

export interface SearchConsoleRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface SearchConsoleQuery {
  startDate: string
  endDate: string
  dimensions: Array<"query" | "page" | "country" | "device" | "date" | "searchAppearance">
  rowLimit?: number
  startRow?: number
  searchType?: "web" | "image" | "video" | "news" | "discover" | "googleNews"
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function credentials() {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim()
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim()

  if (!clientEmail || !privateKey || !siteUrl) return null
  return { clientEmail, privateKey, siteUrl }
}

export function searchConsoleConfiguration(): {
  configured: boolean
  siteUrl: string | null
  missing: string[]
} {
  const missing: string[] = []
  if (!process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim()) missing.push("GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL")
  if (!process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.trim()) missing.push("GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY")
  if (!process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim()) missing.push("GOOGLE_SEARCH_CONSOLE_SITE_URL")

  return {
    configured: missing.length === 0,
    siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || null,
    missing,
  }
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token

  const creds = credentials()
  if (!creds) throw new Error("Google Search Console API credentials are not configured")

  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claim = base64url(
    JSON.stringify({
      iss: creds.clientEmail,
      scope: SEARCH_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  )
  const unsigned = `${header}.${claim}`
  const signer = createSign("RSA-SHA256")
  signer.update(unsigned)
  signer.end()
  const signature = signer.sign(creds.privateKey)
  const assertion = `${unsigned}.${base64url(signature)}`

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Google OAuth token exchange failed: HTTP ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error("Google OAuth token response did not contain access_token")

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in ?? 3600) * 1000,
  }
  return data.access_token
}

export async function querySearchConsole(query: SearchConsoleQuery): Promise<SearchConsoleRow[]> {
  const creds = credentials()
  if (!creds) return []

  const token = await accessToken()
  const endpoint =
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(creds.siteUrl)}/searchAnalytics/query`

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      startDate: query.startDate,
      endDate: query.endDate,
      dimensions: query.dimensions,
      rowLimit: Math.min(Math.max(query.rowLimit ?? 5000, 1), 25_000),
      startRow: Math.max(query.startRow ?? 0, 0),
      type: query.searchType ?? "web",
      dataState: "final",
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Search Console query failed: HTTP ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { rows?: SearchConsoleRow[] }
  return Array.isArray(data.rows) ? data.rows : []
}

export async function inspectSearchConsoleUrl(url: string): Promise<unknown | null> {
  const creds = credentials()
  if (!creds) return null

  const token = await accessToken()
  const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      inspectionUrl: url,
      siteUrl: creds.siteUrl,
      languageCode: "en-US",
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`URL Inspection request failed: HTTP ${res.status} ${await res.text()}`)
  }

  return res.json()
}
