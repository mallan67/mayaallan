import { NextRequest, NextResponse } from "next/server"
import { submitToIndexNow } from "@/lib/indexnow"
import { listScenarios } from "@/lib/scenarios"
import { listPosts } from "@/lib/posts"
import { sql } from "@/lib/db"
import { SITE_URL } from "@/lib/identity"
import { alertAdmin } from "@/lib/alert-admin"
import { safeCompare } from "@/lib/safe-compare"

// IndexNow accepts at most 10,000 URLs per submission. Cap the manual
// `urls[]` input well within that so a caller can't push an oversized
// payload at the upstream API (or balloon memory building the request).
const MAX_MANUAL_URLS = 10_000

// =============================================================================
// POST /api/indexnow/submit — manually trigger an IndexNow submission.
// =============================================================================
// Two modes, controlled by request body:
//
//   { "urls": ["https://.../path1", "https://.../path2"] }
//     Submit only the specified URLs.
//
//   { "mode": "all" }
//     Submit every public page (books + scenarios + blog posts). Useful for
//     bulk re-indexing after a major content overhaul. Limit ~10,000 URLs.
//
// Auth: required. Pass header `x-indexnow-secret: <INDEXNOW_SUBMIT_SECRET>`.
// Without auth the endpoint 401s — otherwise anyone could pin your daily
// IndexNow quota by spamming submissions.
//
// Recommended usage:
//   - From a cron/scheduled function after scenario or post publish events.
//   - Manually after a major batch of content updates.
// =============================================================================

export async function POST(req: NextRequest) {
  // Auth — simple shared-secret header. Set INDEXNOW_SUBMIT_SECRET in env.
  const secret = process.env.INDEXNOW_SUBMIT_SECRET
  const provided = req.headers.get("x-indexnow-secret")
  if (!secret || !provided || !safeCompare(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  let urls: string[] = []

  if (Array.isArray(body?.urls)) {
    urls = body.urls.filter((u: unknown): u is string => typeof u === "string")
    if (urls.length > MAX_MANUAL_URLS) {
      return NextResponse.json(
        { error: `Too many URLs. Submit at most ${MAX_MANUAL_URLS} per request.` },
        { status: 400 }
      )
    }
  } else if (body?.mode === "all") {
    urls = await collectAllPublicUrls()
  } else {
    return NextResponse.json(
      { error: 'Body must be { urls: string[] } or { mode: "all" }' },
      { status: 400 }
    )
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: "No URLs to submit" }, { status: 400 })
  }

  const result = await submitToIndexNow(urls)
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

async function collectAllPublicUrls(): Promise<string[]> {
  const urls: string[] = [
    SITE_URL,
    `${SITE_URL}/about`,
    `${SITE_URL}/books`,
    `${SITE_URL}/scenarios`,
    `${SITE_URL}/belief-inquiry`,
    `${SITE_URL}/nervous-system-reset`,
    `${SITE_URL}/integration-reflection`,
    `${SITE_URL}/integration-journal`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/events`,
    `${SITE_URL}/media`,
    `${SITE_URL}/contact`,
  ]

  // Scenarios (markdown). Previously the catch swallowed entirely — a
  // bundler regression that moves /content/scenarios out of the deployed
  // Lambda silently empties the IndexNow submission. Now alerted; URL
  // list still proceeds with what's available.
  try {
    const scenarios = await listScenarios()
    for (const s of scenarios) urls.push(`${SITE_URL}/scenarios/${s.slug}`)
  } catch (err) {
    await alertAdmin({
      severity: "warning",
      subject: "IndexNow: scenarios listing failed (partial submission)",
      body:
        "listScenarios() threw inside the IndexNow URL collector. Submitted " +
        "URL list will be missing /scenarios/* entries until this resolves.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "indexnow:scenarios-list-failed",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
  }

  // Blog posts (markdown)
  try {
    const posts = await listPosts()
    for (const p of posts) urls.push(`${SITE_URL}/blog/${p.slug}`)
  } catch (err) {
    await alertAdmin({
      severity: "warning",
      subject: "IndexNow: blog posts listing failed (partial submission)",
      body:
        "listPosts() threw inside the IndexNow URL collector. Submitted " +
        "URL list will be missing /blog/* entries until this resolves.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "indexnow:posts-list-failed",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
  }

  // Books (Supabase)
  try {
    const books = await sql`
      select slug
      from books
      where is_published = true and is_visible = true
    `
    for (const b of books) urls.push(`${SITE_URL}/books/${b.slug}`)
  } catch (err) {
    await alertAdmin({
      severity: "warning",
      subject: "IndexNow: books query failed (partial submission)",
      body:
        "Supabase books query threw inside the IndexNow URL collector. " +
        "Submitted URL list will be missing /books/* entries until this resolves.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "indexnow:books-query-failed",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
  }

  return urls
}
