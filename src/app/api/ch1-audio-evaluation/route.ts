import { readFile } from "node:fs/promises"
import path from "node:path"
import { generateText, type LanguageModel } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"

export const maxDuration = 60

function getModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER ?? "gateway").toLowerCase()
  return provider === "direct" ? google("gemini-2.5-flash") : "google/gemini-2.5-flash"
}

export async function GET() {
  const root = path.join(process.cwd(), "scratchpad", "ch1-audio-review")
  const [current, v2, v1] = await Promise.all([
    readFile(path.join(root, "CH1-CURRENT-comparison.mp3")),
    readFile(path.join(root, "CH1-V2-comparison.mp3")),
    readFile(path.join(root, "CH1-V1-comparison.mp3")),
  ])

  const prompt = `You are an expert audiobook editor performing an independent listening evaluation.

The three attached MP3 clips are labeled in order: CURRENT, V2, V1. They contain the same passage:
“These traditions emphasized strict ceremonial protocols—fasting, prayer, and guidance by an elder or curandero—to ensure safe passage through spiritual realms.”

CURRENT is the accepted Chapter 1 voice and performance, but the words “to ensure” break down into incorrect/garbled speech. V2 and V1 are earlier renders that may supply a clean repair.

Listen closely to all three audio files. Do not rely only on metadata. Evaluate:
1. Exact spoken wording and whether “to ensure” is clean and intelligible.
2. Voice/timbre similarity to CURRENT.
3. Pitch, cadence, pace, emotional tone, pronunciation, loudness, and recording texture.
4. Whether V1 or V2 can be spliced naturally into CURRENT.
5. Whether to replace only “to ensure,” a larger clause, the full sentence, or leave CURRENT unchanged.

Return a decisive professional report with these headings:
- CURRENT
- V2
- V1
- Direct comparison
- Final recommendation
- Recommended splice boundaries
- Confidence and caveats

State one winner. Do not hedge unless neither candidate is usable.`

  const result = await generateText({
    model: getModel(),
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "file", data: current, mediaType: "audio/mpeg", filename: "CURRENT.mp3" },
        { type: "file", data: v2, mediaType: "audio/mpeg", filename: "V2.mp3" },
        { type: "file", data: v1, mediaType: "audio/mpeg", filename: "V1.mp3" },
      ],
    }],
    temperature: 0,
  })

  return NextResponse.json({ evaluation: result.text }, {
    headers: { "Cache-Control": "private, no-store" },
  })
}
