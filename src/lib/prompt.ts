import { CountryData } from "@/types";

export const DEFAULT_PROMPT_TEMPLATE = `A vibrant digital travel illustration representing {{country}}.
The scene prominently features {{landmark}} as the main focal point in a wide panoramic composition.
Include a stylized {{icon}} element naturally integrated into the scene.
Include a few small simplified tourist figures (people with backpacks, taking photos) to add life to the scene.
Style: polished digital illustration with clean vector-like rendering, detailed but simplified architecture and scenery, subtle depth and shading (not fully flat), rich saturated colors — deep blues, warm oranges, vivid greens.
{{lighting}}
Characteristic landscape and surroundings of {{country}}.
No text, no words, no letters, no numbers, no flags, no banners, no watermarks anywhere in the image.
Square composition, centered.`;

const LIGHTING_OPTIONS = [
  "Bright blue sky with stylized fluffy white clouds, clear sunny midday lighting.",
  "Golden hour warm sunset lighting with long soft shadows and orange-pink sky.",
  "Bright morning light with a few scattered clouds and crisp clean atmosphere.",
  "Warm afternoon sunlight with a mix of sun and gentle cloud cover.",
  "Soft golden sunrise lighting with pastel sky tones and gentle warmth.",
];

// Deterministic pick based on country name so the same country always gets the same lighting
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildPrompt(template: string, country: CountryData): string {
  const lightingIndex = hashString(country.name) % LIGHTING_OPTIONS.length;
  const lighting = LIGHTING_OPTIONS[lightingIndex];

  return template
    .replace(/\{\{country\}\}/g, country.name)
    .replace(/\{\{landmark\}\}/g, country.landmark)
    .replace(/\{\{icon\}\}/g, country.icon)
    .replace(/\{\{region\}\}/g, country.region)
    .replace(/\{\{code\}\}/g, country.code)
    .replace(/\{\{lighting\}\}/g, lighting);
}
