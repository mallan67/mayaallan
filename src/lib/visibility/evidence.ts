import fs from "node:fs/promises"
import path from "node:path"

export interface EvidenceSource {
  citation: string
  url: string
}

export interface EvidenceClaim {
  id: string
  claim: string
  evidenceClass: string
  status: string
  sources: EvidenceSource[]
  limitations: string
  usedBy: string[]
}

interface EvidenceRegistryFile {
  claims: EvidenceClaim[]
}

const FILE = path.join(process.cwd(), "content", "visibility", "evidence-registry.json")

export async function loadEvidenceRegistry(): Promise<EvidenceClaim[]> {
  const raw = await fs.readFile(FILE, "utf8")
  const parsed = JSON.parse(raw) as EvidenceRegistryFile
  return Array.isArray(parsed.claims) ? parsed.claims : []
}

export async function evidenceCoverageByPage(): Promise<Array<{
  page: string
  claims: number
  sources: number
  statuses: string[]
}>> {
  const claims = await loadEvidenceRegistry()
  const map = new Map<string, { claims: number; sources: Set<string>; statuses: Set<string> }>()

  for (const claim of claims) {
    for (const page of claim.usedBy) {
      const item = map.get(page) ?? { claims: 0, sources: new Set<string>(), statuses: new Set<string>() }
      item.claims++
      for (const source of claim.sources) item.sources.add(source.url)
      item.statuses.add(claim.status)
      map.set(page, item)
    }
  }

  return [...map.entries()]
    .map(([page, value]) => ({
      page,
      claims: value.claims,
      sources: value.sources.size,
      statuses: [...value.statuses].sort(),
    }))
    .sort((a, b) => b.claims - a.claims || a.page.localeCompare(b.page))
}
