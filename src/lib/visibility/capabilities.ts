export interface VisibilityCapability {
  id: number
  name: string
  status: "implemented" | "external-activation"
  evidence: string[]
}

export const VISIBILITY_CAPABILITIES: VisibilityCapability[] = [
  {
    id: 1,
    name: "Grounded AI search probes",
    status: "implemented",
    evidence: [
      "src/lib/aeo/engines.ts",
      "src/lib/aeo/runner.ts",
      "src/app/admin/aeo/page.tsx"
    ],
  },
  {
    id: 2,
    name: "Google Search Console ingestion",
    status: "external-activation",
    evidence: [
      "src/lib/search-console/client.ts",
      "src/app/admin/visibility/page.tsx",
      ".env.example"
    ],
  },
  {
    id: 3,
    name: "Search opportunity engine",
    status: "implemented",
    evidence: [
      "src/lib/search-console/opportunities.ts",
      "src/app/admin/visibility/page.tsx"
    ],
  },
  {
    id: 4,
    name: "Answer and topic graph",
    status: "implemented",
    evidence: [
      "src/lib/visibility/topic-graph.ts",
      "src/app/admin/visibility/page.tsx"
    ],
  },
  {
    id: 5,
    name: "Answer-first page structure",
    status: "implemented",
    evidence: [
      "src/app/scenarios/[slug]/page.tsx",
      "src/app/belief-inquiry/page.tsx",
      "src/app/nervous-system-reset/page.tsx",
      "src/app/integration-reflection/page.tsx"
    ],
  },
  {
    id: 6,
    name: "Evidence boundary registry",
    status: "implemented",
    evidence: [
      "src/lib/visibility/evidence-registry.ts",
      "tests/visibility/visibility-command-center.test.mjs"
    ],
  },
  {
    id: 7,
    name: "AEO prompt intent matrix",
    status: "implemented",
    evidence: [
      "content/aeo-prompts.json",
      "src/lib/aeo/prompts.ts",
      "src/lib/aeo/runner.ts"
    ],
  },
  {
    id: 8,
    name: "Citation gap tracking",
    status: "implemented",
    evidence: [
      "src/lib/aeo/source-gaps.ts",
      "src/app/admin/aeo/page.tsx",
      "src/app/admin/visibility/page.tsx"
    ],
  },
  {
    id: 9,
    name: "Internal linking graph",
    status: "implemented",
    evidence: [
      "src/lib/visibility/topic-graph.ts",
      "src/app/admin/visibility/page.tsx"
    ],
  },
  {
    id: 10,
    name: "Multimodal SEO",
    status: "implemented",
    evidence: [
      "src/app/seo-visual/[slug]/route.ts",
      "src/components/SeoExplainerVisual.tsx",
      "src/lib/visibility/visual-readiness.ts"
    ],
  },
  {
    id: 11,
    name: "Entity identity and Google creator readiness",
    status: "external-activation",
    evidence: [
      "src/lib/identity.ts",
      "src/lib/visibility/entity-readiness.ts",
      "src/lib/structured-data.ts"
    ],
  },
  {
    id: 12,
    name: "Google generative AI inclusion readiness",
    status: "external-activation",
    evidence: [
      "src/lib/visibility/entity-readiness.ts",
      ".env.example"
    ],
  },
  {
    id: 13,
    name: "Search and AI crawler telemetry",
    status: "implemented",
    evidence: [
      "src/lib/crawler-telemetry.ts",
      "middleware.ts",
      "src/app/admin/visibility/page.tsx"
    ],
  },
]
