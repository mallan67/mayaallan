import "server-only"
import fs from "node:fs/promises"
import path from "node:path"

export interface VisualAssetCheck {
  id: string
  page: string
  ready: boolean
}

const ROUTE_FILE = "src/app/seo-visual/[slug]/route.ts"
const TARGETS = [
  ["belief-inquiry", "src/app/belief-inquiry/page.tsx"],
  ["nervous-system-reset", "src/app/nervous-system-reset/page.tsx"],
  ["integration-reflection", "src/app/integration-reflection/page.tsx"],
  ["integration-journal", "src/app/integration-journal/page.tsx"],
] as const

async function read(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(process.cwd(), file), "utf8")
  } catch {
    return ""
  }
}

export async function visualAssetReadiness(): Promise<VisualAssetCheck[]> {
  const routeSource = await read(ROUTE_FILE)

  return Promise.all(
    TARGETS.map(async ([id, page]) => {
      const pageSource = await read(page)
      const routeHasVisual = routeSource.includes(`"${id}"`)
      const pageEmbedsVisual =
        pageSource.includes("SeoExplainerVisual") &&
        pageSource.includes(`slug="${id}"`)

      return {
        id,
        page: "/" + id,
        ready: routeHasVisual && pageEmbedsVisual,
      }
    })
  )
}
