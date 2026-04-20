import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

export type PostFrontmatter = {
  title: string
  subtitle: string
  author: string
  date: string // ISO
  tool_link?: string
  tool_name?: string
  tags?: string[]
}

export type PostSummary = PostFrontmatter & {
  slug: string
}

export type PostFull = PostSummary & {
  body: string // raw markdown body
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

function slugFromFilename(filename: string): string {
  // "01-audit-is-the-wrong-word.md" → "audit-is-the-wrong-word"
  const withoutExt = filename.replace(/\.md$/, "")
  return withoutExt.replace(/^\d+-/, "")
}

export async function listPosts(): Promise<PostSummary[]> {
  let files: string[]
  try {
    files = await fs.readdir(POSTS_DIR)
  } catch {
    return []
  }
  const mdFiles = files.filter((f) => f.endsWith(".md"))

  const summaries: PostSummary[] = []
  for (const file of mdFiles) {
    const full = await fs.readFile(path.join(POSTS_DIR, file), "utf8")
    const { data } = matter(full)
    summaries.push({
      slug: slugFromFilename(file),
      title: String(data.title ?? "Untitled"),
      subtitle: String(data.subtitle ?? ""),
      author: String(data.author ?? "Maya Allan"),
      date: String(data.date ?? new Date().toISOString()),
      tool_link: data.tool_link ? String(data.tool_link) : undefined,
      tool_name: data.tool_name ? String(data.tool_name) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    })
  }

  // Sort newest first
  summaries.sort((a, b) => (a.date < b.date ? 1 : -1))
  return summaries
}

export async function getPost(slug: string): Promise<PostFull | null> {
  let files: string[]
  try {
    files = await fs.readdir(POSTS_DIR)
  } catch {
    return null
  }
  const match = files.find((f) => f.endsWith(".md") && slugFromFilename(f) === slug)
  if (!match) return null

  const full = await fs.readFile(path.join(POSTS_DIR, match), "utf8")
  const { data, content } = matter(full)
  return {
    slug,
    title: String(data.title ?? "Untitled"),
    subtitle: String(data.subtitle ?? ""),
    author: String(data.author ?? "Maya Allan"),
    date: String(data.date ?? new Date().toISOString()),
    tool_link: data.tool_link ? String(data.tool_link) : undefined,
    tool_name: data.tool_name ? String(data.tool_name) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    body: content,
  }
}
