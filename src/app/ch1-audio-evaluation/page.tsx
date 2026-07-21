import { readFile } from "node:fs/promises"
import path from "node:path"
import { generateText, type LanguageModel } from "ai"
import { google } from "@ai-sdk/google"

export const dynamic = "force-static"

function getModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER ?? "gateway").toLowerCase()
  return provider === "direct" ? google("gemini-2.5-flash") : "google/gemini-2.5-flash"
}

export default async function ChapterOneAudioEvaluationPage() {
  const root = path.join(process.cwd(), "scratchpad", "ch1-audio-review")
  const [current, v2, v1] = await Promise.all([
    readFile(path.join(root, "CH1-CURRENT-comparison.mp3")),
    readFile(path.join(root, "CH1-V2-comparison.mp3")),
    readFile(path.join(root, "CH1-V1-comparison.mp3")),
  ])

  const result = await generateText({
    model: getModel(),
    messages: [{
      role: "user",
      content: [
        { type: "text", text: `You are an expert audiobook editor. Independently LISTEN to the three attached files, in this exact order: CURRENT, V2, V1.

All contain this passage: “These traditions emphasized strict ceremonial protocols—fasting, prayer, and guidance by an elder or curandero—to ensure safe passage through spiritual realms.” CURRENT is the accepted Chapter 1 voice, but its words “to ensure” break into garbled speech. V2 and V1 are earlier renders.

Compare exact words, intelligibility, voice/timbre match to CURRENT, pitch, cadence, pacing, emotional tone, pronunciation, loudness, recording texture, and splice seam risk. State whether to replace only “to ensure,” a larger clause, the whole sentence, or leave it. Choose exactly one winner: V1, V2, or NEITHER. Give precise natural-language splice boundaries and explain why. Be decisive and do not infer from filenames or metadata; base the judgment on the audio.` },
        { type: "file", data: current, mediaType: "audio/mpeg", filename: "CURRENT.mp3" },
        { type: "file", data: v2, mediaType: "audio/mpeg", filename: "V2.mp3" },
        { type: "file", data: v1, mediaType: "audio/mpeg", filename: "V1.mp3" },
      ],
    }],
    temperature: 0,
  })

  console.log("CH1_MULTIMODAL_EVALUATION_START")
  console.log(result.text)
  console.log("CH1_MULTIMODAL_EVALUATION_END")

  return <main><pre>{result.text}</pre></main>
}
