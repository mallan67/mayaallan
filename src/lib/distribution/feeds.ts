import { AUTHOR_NAME, SITE_URL } from "@/lib/identity"
import { listPosts } from "@/lib/posts"

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function rfc822(date: string): string {
  const parsed = new Date(date + "T12:00:00Z")
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString()
}

export async function buildRssFeed(): Promise<string> {
  const posts = await listPosts()
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      return [
        "<item>",
        `<title>${xml(post.title)}</title>`,
        `<link>${xml(url)}</link>`,
        `<guid isPermaLink="true">${xml(url)}</guid>`,
        `<description>${xml(post.subtitle)}</description>`,
        `<pubDate>${xml(rfc822(post.date))}</pubDate>`,
        `<author>${xml(AUTHOR_NAME)}</author>`,
        ...(post.tags ?? []).map((tag) => `<category>${xml(tag)}</category>`),
        "</item>",
      ].join("")
    })
    .join("")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${xml(AUTHOR_NAME)} — Writing</title>`,
    `<link>${xml(SITE_URL)}</link>`,
    `<description>${xml("Writing by Maya Allan on self-inquiry, consciousness, reflection, and psychedelic integration.")}</description>`,
    `<language>en-us</language>`,
    `<atom:link href="${xml(SITE_URL + "/feed.xml")}" rel="self" type="application/rss+xml" />`,
    items,
    "</channel>",
    "</rss>",
  ].join("")
}

export async function buildJsonFeed() {
  const posts = await listPosts()
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: `${AUTHOR_NAME} — Writing`,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    items: posts.map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      return {
        id: url,
        url,
        title: post.title,
        summary: post.subtitle,
        date_published: `${post.date}T12:00:00Z`,
        ...(post.updated ? { date_modified: `${post.updated}T12:00:00Z` } : {}),
        tags: post.tags ?? [],
      }
    }),
  }
}
