export type VisibilityRole = "book" | "scenario" | "article" | "tool" | "authority" | "reference"

export interface VisibilityNode {
  id: string
  path: string
  sourceFile: string
  role: VisibilityRole
  topics: string[]
  requiredLinks: string[]
}

export const VISIBILITY_GRAPH: VisibilityNode[] = [
  {
    id: "book",
    path: "/books/psilocybin-integration-guide",
    sourceFile: "src/app/books/[slug]/page.tsx",
    role: "book",
    topics: ["integration", "journey-scenarios", "safety"],
    requiredLinks: ["/scenarios/ego-dissolution", "/blog/psilocybin-integration-research"],
  },
  {
    id: "ego-scenario",
    path: "/scenarios/ego-dissolution",
    sourceFile: "content/scenarios/ego-dissolution.md",
    role: "scenario",
    topics: ["ego-dissolution", "brain-networks", "integration"],
    requiredLinks: [
      "/integration-reflection",
      "/blog/psilocybin-integration-research",
      "/books/psilocybin-integration-guide",
    ],
  },
  {
    id: "integration-research",
    path: "/blog/psilocybin-integration-research",
    sourceFile: "content/posts/02-psilocybin-integration-research.md",
    role: "article",
    topics: ["integration", "memory-research", "evidence"],
    requiredLinks: [
      "/integration-reflection",
      "/scenarios/ego-dissolution",
      "/books/psilocybin-integration-guide",
      "/methods",
    ],
  },
  {
    id: "belief-inquiry",
    path: "/belief-inquiry",
    sourceFile: "src/app/belief-inquiry/page.tsx",
    role: "tool",
    topics: ["beliefs", "self-inquiry", "methods"],
    requiredLinks: ["/methods"],
  },
  {
    id: "nervous-system-reset",
    path: "/nervous-system-reset",
    sourceFile: "src/app/nervous-system-reset/page.tsx",
    role: "tool",
    topics: ["grounding", "body-awareness", "methods"],
    requiredLinks: ["/methods"],
  },
  {
    id: "integration-reflection",
    path: "/integration-reflection",
    sourceFile: "src/app/integration-reflection/page.tsx",
    role: "tool",
    topics: ["integration", "memory-research", "reflection"],
    requiredLinks: ["/methods", "/blog/psilocybin-integration-research"],
  },
  {
    id: "integration-journal",
    path: "/integration-journal",
    sourceFile: "src/app/integration-journal/page.tsx",
    role: "tool",
    topics: ["integration", "reflection", "journaling"],
    requiredLinks: ["/methods", "/books/psilocybin-integration-guide"],
  },
  {
    id: "methods",
    path: "/methods",
    sourceFile: "src/app/methods/page.tsx",
    role: "authority",
    topics: ["methods", "self-inquiry", "reflection"],
    requiredLinks: ["/belief-inquiry", "/nervous-system-reset", "/integration-reflection"],
  },
  {
    id: "glossary",
    path: "/glossary",
    sourceFile: "src/app/glossary/page.tsx",
    role: "reference",
    topics: ["brain-networks", "integration", "definitions"],
    requiredLinks: [],
  },
]

const BY_ID = new Map(VISIBILITY_GRAPH.map((node) => [node.id, node]))

export function visibilityNode(id: string): VisibilityNode | undefined {
  return BY_ID.get(id)
}

export function suggestRelatedNodes(id: string, limit = 5): VisibilityNode[] {
  const current = BY_ID.get(id)
  if (!current) return []

  const linked = new Set(current.requiredLinks)
  const topicSet = new Set(current.topics)

  return VISIBILITY_GRAPH
    .filter((candidate) => candidate.id !== current.id && !linked.has(candidate.path))
    .map((candidate) => ({
      candidate,
      shared: candidate.topics.filter((topic) => topicSet.has(topic)).length,
    }))
    .filter((item) => item.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.candidate.path.localeCompare(b.candidate.path))
    .slice(0, limit)
    .map((item) => item.candidate)
}
