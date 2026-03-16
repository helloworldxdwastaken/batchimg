import { CountryData } from "@/types";

export const DEFAULT_PROMPT_TEMPLATE = `A cartoonish, vibrant, marketing-quality illustration representing {{country}}.
The scene prominently features {{landmark}} as the main focal point.
Include a stylized {{icon}} element integrated into the composition.
Colorful, playful style with clean lines and bold shapes — modern travel poster art.
Characteristic landscape of {{country}} with warm, inviting lighting.
No text, no words, no letters, no numbers, no flags, no banners anywhere in the image.
Square composition, centered, slight vignette effect.`;

export function buildPrompt(template: string, country: CountryData): string {
  return template
    .replace(/\{\{country\}\}/g, country.name)
    .replace(/\{\{landmark\}\}/g, country.landmark)
    .replace(/\{\{icon\}\}/g, country.icon)
    .replace(/\{\{region\}\}/g, country.region)
    .replace(/\{\{code\}\}/g, country.code);
}
