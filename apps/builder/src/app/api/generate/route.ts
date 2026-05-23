import { NextRequest, NextResponse } from 'next/server';
import { AiGateway } from '@oneatlas/ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentMetadata } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const gateway = new AiGateway();
    let appMetadata;

    if (currentMetadata) {
      appMetadata = await gateway.updateApp(currentMetadata, prompt);
    } else {
      appMetadata = await gateway.generateApp(prompt);
    }

    return NextResponse.json(appMetadata);
  } catch (error: any) {
    console.error("API Generate Error:", error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
