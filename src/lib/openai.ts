import OpenAI from "openai";

let overrideKey: string | null = null;

export function setApiKeyOverride(key: string | null) {
  overrideKey = key;
}

export function getApiKeyOverride(): string | null {
  return overrideKey;
}

export function getOpenAIClient(): OpenAI {
  const apiKey = overrideKey || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env.local or enter it in settings.");
  }
  return new OpenAI({ apiKey });
}
