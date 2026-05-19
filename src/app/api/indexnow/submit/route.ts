import { NextRequest, NextResponse } from "next/server"
import { submitToIndexNow } from "@/lib/indexnow"
import { listScenarios } from "@/lib/scenarios"
import { listPosts } from "@/lib/posts"
import { supabaseAdmin, Tables } from "@/lib/supabaseAdmin"
import { SITE_URL } from "@/lib/identity"

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
  if (!secret || provided !== secret) {
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
    `${SITE_URL}/integration`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/articles`,
    `${SITE_URL}/events`,
    `${SITE_URL}/media`,
    `${SITE_URL}/contact`,
  ]

  // Scenarios (markdown)
  try {
    const scenarios = await listScenarios()
    for (const s of scenarios) urls.push(`${SITE_URL}/scenarios/${s.slug}`)
  } catch {
    // ignore
  }

  // Blog posts (markdown)
  try {
    const posts = await listPosts()
    for (const p of posts) urls.push(`${SITE_URL}/blog/${p.slug}`)
  } catch {
    // ignore
  }

  // Books (Supabase)
  try {
    const { data: books } = await supabaseAdmin
      .from(Tables.books)
      .select("slug")
      .eq("is_published", true)
      .eq("is_visible", true)
    for (const b of books ?? []) urls.push(`${SITE_URL}/books/${b.slug}`)
  } catch {
    // ignore
  }

  return urls
}
