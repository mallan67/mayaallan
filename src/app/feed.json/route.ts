import { NextResponse } from "next/server"
import { buildJsonFeed } from "@/lib/distribution/feeds"

export const revalidate = 3600

export async function GET() {
  return NextResponse.json(await buildJsonFeed(), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
