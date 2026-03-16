import { NextRequest, NextResponse } from "next/server";
import { setApiKeyOverride, getApiKeyOverride } from "@/lib/openai";

export async function GET() {
  const override = getApiKeyOverride();
  return NextResponse.json({
    hasEnvKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-api-key-here",
    hasOverride: !!override,
    // Never expose the full key
    overridePreview: override ? `${override.slice(0, 8)}...` : null,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    setApiKeyOverride(apiKey || null);
    return NextResponse.json({ message: apiKey ? "API key override set" : "API key override cleared" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
