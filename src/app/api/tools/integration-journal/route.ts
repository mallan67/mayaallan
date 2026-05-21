import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { IntegrationJournalDocument, type JourneyPhase } from "@/lib/pdf/integration-journal"
import { alertAdmin } from "@/lib/alert-admin"

// =============================================================================
// POST /api/tools/integration-journal — generates a downloadable journal PDF.
// =============================================================================
// Body: { phase: "preparation" | "journey" | "integration" | "shadow-work",
//         intention?: string,    // optional, max ~280 chars, shown on cover
//         journeyDate?: string } // optional, shown on cover
//
// Returns: application/pdf with Content-Disposition: attachment.
//
// No auth — this is a public free tool. Light validation on the inputs to
// keep the PDF rendering pipeline from being abused.
// =============================================================================

const VALID_PHASES: JourneyPhase[] = ["preparation", "journey", "integration", "shadow-work"]

export const maxDuration = 30

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const phase = body?.phase
  if (!VALID_PHASES.includes(phase)) {
    return NextResponse.json(
      { error: `phase must be one of: ${VALID_PHASES.join(", ")}` },
      { status: 400 }
    )
  }

  // Sanitize the user-supplied intention. Strip to plaintext, hard-cap length.
  // Anything longer is probably someone trying to fit a paragraph on a cover.
  const intention =
    typeof body?.intention === "string"
      ? body.intention.replace(/[\r\n]+/g, " ").slice(0, 280).trim()
      : undefined

  const journeyDate =
    typeof body?.journeyDate === "string" ? body.journeyDate.slice(0, 40).trim() : undefined

  try {
    const pdfBuffer = await renderToBuffer(
      IntegrationJournalDocument({ phase, intention, journeyDate })
    )

    const filename = `integration-journal-${phase}.pdf`
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Don't cache personalized PDFs — every (phase, intention) combo is unique
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[integration-journal] PDF render failed:", err)
    // High-traffic free tool; a render regression (template breakage,
    // @react-pdf/renderer font fetch outage, etc.) breaks every download.
    // Previously silent — customer hit a 500 and we found out from
    // complaints. Once-per-day dedup.
    await alertAdmin({
      severity: "error",
      subject: "Integration-journal PDF render failed",
      body:
        "renderToBuffer threw on the integration-journal route. Every download " +
        "of the free journal PDF is currently failing. Likely a template " +
        "regression or @react-pdf/renderer dependency issue. Check Vercel logs.",
      details: { errorMessage: err instanceof Error ? err.message : String(err) },
      dedupKey: "integration-journal:render-failed",
      dedupWindowMs: 24 * 60 * 60 * 1000,
    })
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
