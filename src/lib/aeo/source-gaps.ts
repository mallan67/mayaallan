import type { CitationRow } from "@/lib/aeo/storage"

export interface ExternalSourceCounts {
  host: string
  urls: number
  probes: number
  prompts: number
}

export function aggregateExternalSources(
  rows: Array<CitationRow & { run_id?: string; run_at?: string }>,
  ownHosts: string[] = ["mayaallan.com", "www.mayaallan.com"]
): ExternalSourceCounts[] {
  const own = new Set(ownHosts.map((host) => host.toLowerCase()))
  const map = new Map<string, { host: string; urlSet: Set<string>; probeSet: Set<string>; promptSet: Set<string> }>()

  rows.forEach((row, rowIndex) => {
    if (row.error || row.classifier_version !== 2 || !row.search_capable) return
    for (const raw of row.source_urls ?? []) {
      let parsed: URL
      try {
        parsed = new URL(raw)
      } catch {
        continue
      }

      const host = parsed.hostname.toLowerCase()
      if (!host || own.has(host)) continue

      const current = map.get(host) ?? {
        host,
        urlSet: new Set<string>(),
        probeSet: new Set<string>(),
        promptSet: new Set<string>(),
      }
      current.urlSet.add(parsed.toString())
      current.probeSet.add(`${row.run_id ?? "run"}:${row.engine}:${row.prompt_id}:${rowIndex}`)
      current.promptSet.add(row.prompt_id)
      map.set(host, current)
    }
  })

  return Array.from(map.values())
    .map((item) => ({
      host: item.host,
      urls: item.urlSet.size,
      probes: item.probeSet.size,
      prompts: item.promptSet.size,
    }))
    .sort((a, b) => b.prompts - a.prompts || b.probes - a.probes || b.urls - a.urls || a.host.localeCompare(b.host))
}
