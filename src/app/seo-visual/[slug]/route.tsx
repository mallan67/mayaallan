import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { OG_CACHE_HEADERS, loadInterFont, ogFonts } from "@/lib/og-image-helpers"

export const runtime = "edge"

type Visual = {
  title: string
  subtitle: string
  steps: string[]
}

const VISUALS: Record<string, Visual> = {
  "belief-inquiry": {
    title: "Belief Inquiry",
    subtitle: "A reflection path that keeps your own language central",
    steps: ["Name the belief", "Explore its context", "Notice exceptions", "Reflect on what changes"],
  },
  "nervous-system-reset": {
    title: "Nervous System Reset",
    subtitle: "A gentle body-first check-in for moments of activation",
    steps: ["Orient to the present", "Notice sensations", "Choose one small settling step", "Check in again"],
  },
  "integration-reflection": {
    title: "Integration Reflection",
    subtitle: "A structured way to place a new experience beside an older expectation",
    steps: ["Describe what happened", "Name the older pattern", "Hold both in view", "Choose a small next step"],
  },
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const visual = VISUALS[slug]
  if (!visual) return new Response("Not found", { status: 404 })

  const [regular, bold] = await Promise.all([
    loadInterFont(400, `seo-visual:${slug}`),
    loadInterFont(700, `seo-visual:${slug}`),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f8fafc",
          padding: "70px",
          fontFamily: "Inter",
          color: "#0f172a",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "46px" }}>
          <div style={{ fontSize: "54px", fontWeight: 700, lineHeight: 1.05 }}>{visual.title}</div>
          <div style={{ fontSize: "24px", color: "#475569", marginTop: "16px" }}>{visual.subtitle}</div>
        </div>

        <div style={{ display: "flex", gap: "18px", width: "100%", flex: 1 }}>
          {visual.steps.map((step, index) => (
            <div
              key={step}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid #cbd5e1",
                borderRadius: "22px",
                padding: "28px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e0f2fe",
                  color: "#075985",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </div>
              <div style={{ fontSize: "25px", fontWeight: 700, lineHeight: 1.25 }}>{step}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "34px", fontSize: "18px", color: "#64748b" }}>
          <span>mayaallan.com</span>
          <span>Educational reflection tool</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 675,
      fonts: ogFonts(regular, bold),
      headers: OG_CACHE_HEADERS,
    }
  )
}
