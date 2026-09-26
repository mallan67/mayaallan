export type EvidenceKind =
  | "primary-study"
  | "review"
  | "theoretical-model"
  | "clinical-theory"
  | "preclinical"

export interface EvidenceRecord {
  id: string
  kind: EvidenceKind
  sourceLabel: string
  sourceUrl: string
  canonicalDiscussion: string
  appliesTo: string[]
  boundary: string
  lastReviewed: string
}

export const EVIDENCE_REGISTRY: EvidenceRecord[] = [
  {
    id: "human-memory-reconsolidation-review",
    kind: "review",
    sourceLabel: "Elsey, Van Ast & Kindt (2018), Psychological Bulletin",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29792441/",
    canonicalDiscussion: "/blog/psilocybin-integration-research#what-the-research-shows",
    appliesTo: ["/integration-reflection", "/blog/psilocybin-integration-research"],
    boundary:
      "Use as evidence about the contested human reconsolidation literature, not as proof that a specific reflection exercise produces neural rewriting.",
    lastReviewed: "2026-09-05",
  },
  {
    id: "rebus-model",
    kind: "theoretical-model",
    sourceLabel: "Carhart-Harris & Friston (2019), Pharmacological Reviews",
    sourceUrl: "https://doi.org/10.1124/pr.118.017160",
    canonicalDiscussion: "/blog/psilocybin-integration-research#what-the-psilocybin-research-adds",
    appliesTo: ["/blog/psilocybin-integration-research", "/glossary"],
    boundary:
      "Describe as a theoretical framework. Do not present it as proof that any particular post-experience practice improves outcomes.",
    lastReviewed: "2026-09-05",
  },
  {
    id: "integration-concept-analysis",
    kind: "review",
    sourceLabel: "Bathje, Majeski & Kudowor (2022), Frontiers in Psychology",
    sourceUrl: "https://doi.org/10.3389/fpsyg.2022.824077",
    canonicalDiscussion: "/blog/psilocybin-integration-research#what-the-psilocybin-research-adds",
    appliesTo: ["/integration-reflection", "/integration-journal", "/blog/psilocybin-integration-research"],
    boundary:
      "Supports describing integration as varied and under-researched. Do not use it to claim one integration method is proven superior.",
    lastReviewed: "2026-09-05",
  },
  {
    id: "ego-dissolution-inventory",
    kind: "primary-study",
    sourceLabel: "Nour et al. (2016), Frontiers in Human Neuroscience",
    sourceUrl: "https://doi.org/10.3389/fnhum.2016.00269",
    canonicalDiscussion: "/scenarios/ego-dissolution",
    appliesTo: ["/scenarios/ego-dissolution", "/glossary"],
    boundary:
      "Supports measurement and description of ego-dissolution experiences; it is not a treatment-outcome study.",
    lastReviewed: "2026-09-05",
  },
]

export function evidenceForPath(path: string): EvidenceRecord[] {
  return EVIDENCE_REGISTRY.filter((record) => record.appliesTo.includes(path))
}
