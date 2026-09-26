import { NextResponse } from "next/server"
import { buildRssFeed } from "@/lib/distribution/feeds"

export const revalidate = 3600

export async function GET() {
  const body = await buildRssFeed()
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
