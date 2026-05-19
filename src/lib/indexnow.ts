import "server-only"
import { SITE_URL } from "@/lib/identity"

// =============================================================================
// IndexNow — instant search engine indexing notification.
// =============================================================================
// IndexNow is an open API jointly supported by Bing, Yandex, Naver, Seznam,
// DuckDuckGo (via Bing index), and several smaller engines. When you publish
// or update a page, you POST the URL to a single IndexNow endpoint and every
// participating engine crawls it within minutes.
//
// HOW IT WORKS:
//   1. You generate a random alphanumeric key (no auth required).
//   2. You host that key as a text file at `/{key}.txt` on your domain.
//      This proves you own the domain.
//   3. You POST URLs to https://api.indexnow.org/indexnow with the key.
//   4. Bing + Yandex + Naver crawl those URLs immediately.
//
// USAGE:
//   In any server action / API route / cron after publishing content:
//     import { submitToIndexNow } from "@/lib/indexnow"
//     await submitToIndexNow([
//       `${SITE_URL}/scenarios/ego-dissolution`,
//       `${SITE_URL}/blog/some-new-post`,
//     ])
//
// SETUP:
//   1. Generate a key: a UUID or 32-char hex string works. Set env var
//      INDEXNOW_KEY to that value.
//   2. Verify the key is reachable at https://www.mayaallan.com/{INDEXNOW_KEY}.txt
//      (the route handler at src/app/[key]/route.ts serves it dynamically).
//   3. The first submission auto-registers your domain with the IndexNow
//      partner engines.
//
// Docs: https://www.indexnow.org/documentation
// =============================================================================

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

export interface IndexNowResult {
  ok: boolean
  status: number
  /** Submitted URLs (echoed for logging) */
  urls: string[]
  /** Error detail if !ok */
  error?: string
}

/**
 * Submit up to 10,000 URLs per call to IndexNow. The participating engines
 * crawl them within minutes.
 *
 * Returns ok=true on HTTP 200 or 202 (accepted but pending validation).
 * Silently no-ops (returns ok=false with error="not configured") if
 * INDEXNOW_KEY isn't set, so this is safe to call in dev/preview where you
 * don't want to ping production engines.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return { ok: false, status: 0, urls, error: "INDEXNOW_KEY env var not set — skipping submission" }
  }

  // Sanity check: every URL must be on the same host as keyLocation.
  // IndexNow rejects mixed-host batches.
  const host = new URL(SITE_URL).host
  const filteredUrls = urls.filter((u) => {
    try {
      return new URL(u).host === host
    } catch {
      return false
    }
  })
  if (filteredUrls.length === 0) {
    return { ok: false, status: 0, urls, error: "No valid same-host URLs to submit" }
  }

  const body = {
    host,
    key,
    // Standard IndexNow pattern: key value as the filename at the root.
    // Served as a static file from public/{key}.txt — static files take
    // precedence over the [locale] dynamic segment, so there's no collision.
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: filteredUrls.slice(0, 10000), // IndexNow per-request limit
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      // Don't retry on failure — IndexNow rejects rapid duplicate submissions
      // and a queue retry would just get throttled. Schedule a retry from
      // outside this function if needed.
      cache: "no-store",
    })

    // IndexNow returns 200 (success) or 202 (accepted, validation pending).
    // 400 = malformed, 403 = key file not found, 422 = URL doesn't match host,
    // 429 = too many requests.
    return {
      ok: res.ok || res.status === 202,
      status: res.status,
      urls: filteredUrls,
      ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      urls: filteredUrls,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
