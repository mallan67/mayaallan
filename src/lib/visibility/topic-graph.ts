import fs from "node:fs/promises"
import path from "node:path"

export interface TopicNode {
  id: string
  kind: string
  path: string
  topics: string[]
}

export interface TopicEdge {
  from: string
  to: string
  relation: string
}

interface TopicGraphFile {
  nodes: TopicNode[]
  edges: TopicEdge[]
}

const GRAPH_FILE = path.join(process.cwd(), "content", "visibility", "topic-graph.json")

export async function loadTopicGraph(): Promise<TopicGraphFile> {
  const raw = await fs.readFile(GRAPH_FILE, "utf8")
  const parsed = JSON.parse(raw) as TopicGraphFile
  return {
    nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
  }
}

export interface InternalLinkRecommendation {
  from: TopicNode
  to: TopicNode
  relation: string
  sharedTopics: string[]
  score: number
}

export async function internalLinkRecommendations(): Promise<InternalLinkRecommendation[]> {
  const graph = await loadTopicGraph()
  const explicit = new Set(graph.edges.map((edge) => `${edge.from}->${edge.to}`))
  const out: InternalLinkRecommendation[] = []

  for (const from of graph.nodes) {
    for (const to of graph.nodes) {
      if (from.id === to.id || explicit.has(`${from.id}->${to.id}`)) continue
      const sharedTopics = from.topics.filter((topic) => to.topics.includes(topic))
      if (sharedTopics.length === 0) continue

      // Prefer editorial -> evidence/tool/hub links over arbitrary mutual links.
      let score = sharedTopics.length * 10
      if (["article", "scenario", "book"].includes(from.kind)) score += 4
      if (["tool", "hub", "article"].includes(to.kind)) score += 3

      out.push({ from, to, relation: "shared-topic", sharedTopics, score })
    }
  }

  return out
    .sort((a, b) => b.score - a.score || a.from.path.localeCompare(b.from.path) || a.to.path.localeCompare(b.to.path))
    .slice(0, 100)
}

export async function relatedNodes(nodeId: string): Promise<Array<{ node: TopicNode; relation: string }>> {
  const graph = await loadTopicGraph()
  const byId = new Map(graph.nodes.map((node) => [node.id, node]))
  const out: Array<{ node: TopicNode; relation: string }> = []
  for (const edge of graph.edges) {
    if (edge.from !== nodeId) continue
    const node = byId.get(edge.to)
    if (node) out.push({ node, relation: edge.relation })
  }
  return out
}
