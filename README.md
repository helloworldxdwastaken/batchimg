# BatchImg

Batch generate cartoonish marketing-quality images for every country using OpenAI's gpt-image-1 API. Includes a dashboard UI to monitor progress, evaluate results, re-run individual failures, and edit the prompt template.

## Setup

```bash
# Install dependencies
npm install

# Set your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You can also set or override the API key from the **Settings** tab in the UI (session-only, not saved to disk).

## Usage

- **Countries tab** — Grid of all countries with status badges. Click "Gen" to generate a single image, or "Redo" to re-generate an existing one.
- **Start Batch** — Generates images for all pending countries sequentially with rate-limit delays. Use "Force re-generate all" to redo everything.
- **Cancel** — Stops the batch after the current image finishes.
- **Prompt tab** — Edit the prompt template. Available placeholders: `{{country}}`, `{{landmark}}`, `{{icon}}`, `{{region}}`, `{{code}}`, `{{lighting}}`. Lighting is automatically varied per country (midday, golden hour, morning, afternoon, sunrise).
- **Settings tab** — View API key status and set an override.
- **Filters** — Search by name, filter by region or status.
- **Reference images** — Click "Ref" on any country card to upload a reference image. View it side-by-side with the generated image in the viewer.

## Output

Generated images are saved to `public/generated/{country-slug}.png` (1024x1024).

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- OpenAI Node SDK (gpt-image-1)
