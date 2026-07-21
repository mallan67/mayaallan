import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const allowed = new Set([
  "CH1-CURRENT-comparison.mp3",
  "CH1-V2-comparison.mp3",
  "CH1-V1-comparison.mp3",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!allowed.has(name)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "scratchpad",
    "ch1-audio-review",
    name,
  );
  const audio = await readFile(filePath);

  return new NextResponse(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audio.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
