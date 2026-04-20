#!/usr/bin/env node
/**
 * Cross-post a blog post to Medium as a draft with a canonical link back to mayaallan.com.
 *
 * Usage:
 *   MEDIUM_INTEGRATION_TOKEN=<token> node scripts/publish-to-medium.mjs <slug> [--public]
 *
 * Args:
 *   slug       — the post slug, e.g. "audit-is-the-wrong-word" (matches a file in content/posts/)
 *   --public   — publish immediately as public (default is draft, giving you a chance to preview in Medium's editor)
 *
 * Requires:
 *   MEDIUM_INTEGRATION_TOKEN in env (generate at https://medium.com/me/settings/security)
 *
 * What it does:
 *   1. Reads the matching markdown file from content/posts/
 *   2. Parses frontmatter + body
 *   3. Posts to Medium via their API with contentFormat: "markdown"
 *   4. Sets canonicalUrl to the corresponding /blog/<slug> on mayaallan.com so Google treats your site as the original
 *   5. Default status is "draft" — review in Medium's web editor, then hit Publish
 */
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

const MEDIUM_API_BASE = "https://api.medium.com/v1"
const SITE_URL = "https://www.mayaallan.com"
const POSTS_DIR = "content/posts"

function parseArgs(argv) {
  const args = argv.slice(2)
  const flags = new Set(args.filter((a) => a.startsWith("--")))
  const positional = args.filter((a) => !a.startsWith("--"))
  return {
    slug: positional[0],
    publishPublic: flags.has("--public"),
  }
}

function slugFromFilename(filename) {
  const withoutExt = filename.replace(/\.md$/, "")
  return withoutExt.replace(/^\d+-/, "")
}

async function findPostFile(slug) {
  const files = await fs.readdir(POSTS_DIR)
  const mdFiles = files.filter((f) => f.endsWith(".md"))
  const match = mdFiles.find((f) => slugFromFilename(f) === slug)
  if (!match) {
    throw new Error(`No post found with slug "${slug}" in ${POSTS_DIR}/`)
  }
  return path.join(POSTS_DIR, match)
}

async function mediumFetch(apiPath, init = {}) {
  const token = process.env.MEDIUM_INTEGRATION_TOKEN
  if (!token) {
    throw new Error(
      "MEDIUM_INTEGRATION_TOKEN is not set.\n" +
      "Generate one at https://medium.com/me/settings/security and pass it as env var."
    )
  }
  const res = await fetch(`${MEDIUM_API_BASE}${apiPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "<no body>")
    throw new Error(`Medium API ${res.status}: ${text}`)
  }
  const json = await res.json()
  return json.data
}

async function main() {
  const { slug, publishPublic } = parseArgs(process.argv)
  if (!slug) {
    console.error("Usage: node scripts/publish-to-medium.mjs <slug> [--public]")
    process.exit(2)
  }

  console.log(`Reading post: ${slug}`)
  const filePath = await findPostFile(slug)
  const raw = await fs.readFile(filePath, "utf8")
  const { data: fm, content: body } = matter(raw)

  if (!fm.title) throw new Error(`Post is missing "title" in frontmatter: ${filePath}`)

  // Keep a short tagline line at top + the body; skip frontmatter block in output
  const contentForMedium = `*${fm.subtitle ?? ""}*\n\n${body.trim()}`

  const canonicalUrl = `${SITE_URL}/blog/${slug}`
  const tags = Array.isArray(fm.tags) ? fm.tags.slice(0, 5) : []
  const publishStatus = publishPublic ? "public" : "draft"

  console.log(`Fetching Medium user identity...`)
  const user = await mediumFetch("/me", { method: "GET" })
  console.log(`Authenticated as ${user.username} (${user.id})`)

  console.log(`Creating ${publishStatus} post on Medium...`)
  const post = await mediumFetch(`/users/${user.id}/posts`, {
    method: "POST",
    body: JSON.stringify({
      title: fm.title,
      contentFormat: "markdown",
      content: contentForMedium,
      tags,
      canonicalUrl,
      publishStatus,
      license: "all-rights-reserved",
    }),
  })

  console.log(`\n✓ ${publishStatus === "draft" ? "Draft" : "Published"} on Medium`)
  console.log(`  Title:        ${post.title}`)
  console.log(`  Medium URL:   ${post.url}`)
  console.log(`  Canonical:    ${canonicalUrl}`)
  if (publishStatus === "draft") {
    console.log(`\nNext: open the URL above, review, and click Publish when ready.`)
  }
}

main().catch((err) => {
  console.error("\nERROR:", err.message)
  process.exit(1)
})
