import "server-only"
import fs from "node:fs/promises"
import path from "node:path"

export interface VisualAssetCheck {
  id: string
  file: string
  ready: boolean
}

const REQUIRED_VISUALS = [
  ["visual-1", "public/images/seo/visual-1.webp"],
  ["visual-2", "public/images/seo/visual-2.webp"],
  ["visual-3", "public/images/seo/visual-3.webp"],
  ["visual-4", "public/images/seo/visual-4.webp"],
] as const

export async function visualAssetReadiness(): Promise<VisualAssetCheck[]> {
  return Promise.all(
    REQUIRED_VISUALS.map(async ([id, file]) => {
      try {
        await fs.access(path.join(process.cwd(), file))
        return { id, file, ready: true }
      } catch {
        return { id, file, ready: false }
      }
    })
  )
}
