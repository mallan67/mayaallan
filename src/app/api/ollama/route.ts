// src/app/api/ollama/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'qwen2.5-coder:7b' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await ollama.generate({
      model,
      prompt: prompt.trim(),
      stream: false,
      options: { temperature: 0.35 }, // slightly creative but reliable for code
    });

    return NextResponse.json({ result: response.response.trim() });
  } catch (err: any) {
    console.error('Ollama error:', err);
    return NextResponse.json({ error: err.message || 'Ollama not responding' }, { status: 500 });
  }
}
