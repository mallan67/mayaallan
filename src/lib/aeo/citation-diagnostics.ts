// =============================================================================
// Citation engineering diagnostics
// =============================================================================
// Pure, deterministic analysis over one stored AI probe. This module never
// pretends to observe a provider's private reranker or hidden context window.
// It uses only telemetry the provider actually exposed: search capability,
// executed queries, returned/consulted sources, citations, and answer text
// classification.
//
// Observable stages:
//   model-memory          — no live search, useful only for memory/brand signal
//   search-unobserved     — search-capable, but provider exposed too little
//                           source telemetry to say whether Maya was retrieved
//   not-retrieved         — search telemetry exists, MayaAllan.com absent
//   retrieved-not-cited   — Maya source exposed/consulted, not cited
//   cited-other-page      — Maya cited, but not an expected destination
//   cited-no-book         — expected Maya page cited, book not named when goal
//                           is book discovery
//   cited-no-author       — expected Maya page cited, author not named when goal
//                           is author discovery
//   citation-success      — observable target achieved
// =============================================================================

export type CitationGoal = "source-citation" | "book-discovery" | "author-discovery"

export type CitationStage =
  | "error"
  | "model-memory"
  | "search-unobserved"
  | "not-retrieved"
  | "retrieved-not-cited"
  | "cited-other-page"
  | "cited-no-book"
  | "cited-no-author"
  | "citation-success"

export interface CitationDiagnosticSpec {
  id: string
  /** Human-readable prompt text for dashboard diagnostics. */
  text?: string
  family?: string
  goal?: CitationGoal
  expected_paths?: string[]
}

export interface CitationDiagnosticRow {
  engine: string
  prompt_id: string
  error: string | null
  search_capable?: boolean
  mention_types?: string[]
  cited_urls?: string[]
  source_urls?: string[]
  search_queries?: string[]
  source_citation?: boolean
}

export interface CitationDiagnostic {
  engine: string
  promptId: string
  family: string
  goal: CitationGoal
  stage: CitationStage
  score: number
  searched: boolean
  telemetryAvailable: boolean
  searchQueries: string[]
  ownSourceUrls: string[]
  ownCitedUrls: string[]
  externalSourceUrls: string[]
  expectedPaths: string[]
  expectedPageHit: boolean
  bookMention: boolean
  authorMention: boolean
  repair: string
  limitation?: string
}

const OWN_HOSTS = new Set(["mayaallan.com", "www.mayaallan.com"])

function ownUrl(raw: string): boolean {
  try {
    return OWN_HOSTS.has(new URL(raw).hostname.toLowerCase())
  } catch {
    return false
  }
}

function pathOf(raw: string): string | null {
  try {
    return new URL(raw).pathname.replace(/\/+$/, "") || "/"
  } catch {
    return null
  }
}

function expectedPathHit(urls: string[], expected: string[]): boolean {
  if (expected.length === 0) return true
  return urls.some((url) => {
    const path = pathOf(url)
    if (!path) return false
    return expected.some((target) => {
      const normalized = target.replace(/\/+$/, "") || "/"
      return path === normalized || path.startsWith(normalized + "/")
    })
  })
}

function result(
  row: CitationDiagnosticRow,
  spec: CitationDiagnosticSpec | undefined,
  stage: CitationStage,
  score: number,
  repair: string,
  extra?: Pick<CitationDiagnostic, "limitation">,
): CitationDiagnostic {
  const sourceUrls = Array.from(new Set(row.source_urls ?? []))
  const citedUrls = Array.from(new Set(row.cited_urls ?? []))
  const ownSourceUrls = sourceUrls.filter(ownUrl)
  const ownCitedUrls = citedUrls.filter(ownUrl)
  const externalSourceUrls = sourceUrls.filter((url) => !ownUrl(url))
  const expectedPaths = spec?.expected_paths ?? []
  const types = new Set(row.mention_types ?? [])

  return {
    engine: row.engine,
    promptId: row.prompt_id,
    family: spec?.family ?? "unassigned",
    goal: spec?.goal ?? "source-citation",
    stage,
    score,
    searched: row.search_capable === true,
    telemetryAvailable:
      Boolean(row.source_citation) ||
      sourceUrls.length > 0 ||
      citedUrls.length > 0 ||
      (row.search_queries ?? []).length > 0,
    searchQueries: Array.from(new Set(row.search_queries ?? [])),
    ownSourceUrls,
    ownCitedUrls,
    externalSourceUrls,
    expectedPaths,
    expectedPageHit: expectedPathHit(ownCitedUrls, expectedPaths),
    bookMention: types.has("book_title"),
    authorMention: types.has("author_name"),
    repair,
    ...extra,
  }
}

export function diagnoseCitationRow(
  row: CitationDiagnosticRow,
  spec?: CitationDiagnosticSpec,
): CitationDiagnostic {
  if (row.error) {
    return result(row, spec, "error", 0, "Fix the provider/API error before interpreting visibility.")
  }

  if (!row.search_capable) {
    return result(
      row,
      spec,
      "model-memory",
      0,
      "Enable a grounded-search probe for this engine before using the result as search/citation evidence.",
      { limitation: "This probe measured model memory, not live retrieval." },
    )
  }

  const sourceUrls = Array.from(new Set(row.source_urls ?? []))
  const citedUrls = Array.from(new Set(row.cited_urls ?? []))
  const ownSourceUrls = sourceUrls.filter(ownUrl)
  const ownCitedUrls = citedUrls.filter(ownUrl)
  const telemetryAvailable =
    Boolean(row.source_citation) ||
    sourceUrls.length > 0 ||
    citedUrls.length > 0 ||
    (row.search_queries ?? []).length > 0

  if (ownSourceUrls.length === 0 && ownCitedUrls.length === 0) {
    if (!telemetryAvailable) {
      return result(
        row,
        spec,
        "search-unobserved",
        1,
        "Keep the probe, but do not infer a retrieval failure until the provider exposes search/source telemetry.",
        { limitation: "The provider searched but exposed no usable source/query evidence for this probe." },
      )
    }
    return result(
      row,
      spec,
      "not-retrieved",
      1,
      "Check index/freshness, strengthen the query-topic page, internal links, entity relationships, and third-party corroboration for this query family.",
    )
  }

  if (ownCitedUrls.length === 0) {
    return result(
      row,
      spec,
      "retrieved-not-cited",
      2,
      "The site entered retrieval. Improve the answer passage: concise definition, direct answer, evidence/citations, and clear attribution without rewriting the whole page.",
    )
  }

  const expected = spec?.expected_paths ?? []
  if (expected.length > 0 && !expectedPathHit(ownCitedUrls, expected)) {
    return result(
      row,
      spec,
      "cited-other-page",
      3,
      "Maya was cited, but not the intended destination. Strengthen canonical page targeting, internal links, topic language, and explicit relationships from the cited page to the expected page.",
    )
  }

  const types = new Set(row.mention_types ?? [])
  if (spec?.goal === "book-discovery" && !types.has("book_title")) {
    return result(
      row,
      spec,
      "cited-no-book",
      4,
      "The source won a citation but the work was not named. Add a truthful, natural book relationship near the relevant passage and preserve the canonical Book/edition graph.",
    )
  }

  if (spec?.goal === "author-discovery" && !types.has("author_name")) {
    return result(
      row,
      spec,
      "cited-no-author",
      4,
      "The source won a citation but the author was not named. Strengthen visible byline/author attribution and the stable Person relationship without adding promotional claims.",
    )
  }

  return result(
    row,
    spec,
    "citation-success",
    5,
    "Preserve the winning page. Test paraphrases in the same query family and build independent corroboration rather than over-editing a successful source.",
  )
}

export interface DiagnosticDelta {
  key: string
  current: CitationDiagnostic
  previous?: CitationDiagnostic
  delta: number | null
  movement: "new" | "improved" | "regressed" | "stable"
}

export function compareDiagnosticRuns(
  currentRows: CitationDiagnosticRow[],
  previousRows: CitationDiagnosticRow[],
  specs: Map<string, CitationDiagnosticSpec>,
): DiagnosticDelta[] {
  const previous = new Map<string, CitationDiagnostic>()
  for (const row of previousRows) {
    const diag = diagnoseCitationRow(row, specs.get(row.prompt_id))
    previous.set(`${row.engine}::${row.prompt_id}`, diag)
  }

  return currentRows.map((row) => {
    const current = diagnoseCitationRow(row, specs.get(row.prompt_id))
    const key = `${row.engine}::${row.prompt_id}`
    const before = previous.get(key)
    if (!before) return { key, current, delta: null, movement: "new" as const }
    const delta = current.score - before.score
    return {
      key,
      current,
      previous: before,
      delta,
      movement: delta > 0 ? "improved" as const : delta < 0 ? "regressed" as const : "stable" as const,
    }
  })
}

export function summarizeDiagnostics(diagnostics: CitationDiagnostic[]) {
  const stages = new Map<CitationStage, number>()
  for (const item of diagnostics) {
    stages.set(item.stage, (stages.get(item.stage) ?? 0) + 1)
  }
  return {
    total: diagnostics.length,
    success: diagnostics.filter((item) => item.stage === "citation-success").length,
    retrieved: diagnostics.filter((item) =>
      ["retrieved-not-cited", "cited-other-page", "cited-no-book", "cited-no-author", "citation-success"].includes(item.stage)
    ).length,
    cited: diagnostics.filter((item) =>
      ["cited-other-page", "cited-no-book", "cited-no-author", "citation-success"].includes(item.stage)
    ).length,
    byStage: Object.fromEntries(stages),
  }
}
