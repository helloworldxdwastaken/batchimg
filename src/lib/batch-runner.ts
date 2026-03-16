import fs from "fs";
import path from "path";
import { CountryData, BatchProgress } from "@/types";
import { getOpenAIClient } from "./openai";
import { buildPrompt } from "./prompt";
import { getPromptTemplate, updateCountryStatus, getState } from "./state";
import { getCountrySlug } from "@/data/countries";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

class BatchRunner {
  private running = false;
  private cancelled = false;
  private progress: BatchProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    current: null,
    running: false,
  };

  async generateOne(country: CountryData): Promise<void> {
    const client = getOpenAIClient();
    const template = getPromptTemplate();
    const prompt = buildPrompt(template, country);
    const slug = getCountrySlug(country.name);

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("No image data returned from API");
    }

    const buffer = Buffer.from(b64, "base64");
    const outputDir = path.join(process.cwd(), "public", "generated");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, `${slug}.png`), buffer);
  }

  async start(countries: CountryData[], force: boolean): Promise<void> {
    if (this.running) {
      throw new Error("Batch already running");
    }

    this.running = true;
    this.cancelled = false;

    const state = getState();
    const queue = force
      ? countries
      : countries.filter((c) => {
          const slug = getCountrySlug(c.name);
          return state.countries[slug]?.status !== "done";
        });

    this.progress = {
      total: queue.length,
      completed: 0,
      failed: 0,
      current: null,
      running: true,
    };

    for (const country of queue) {
      if (this.cancelled) break;

      const slug = getCountrySlug(country.name);
      this.progress.current = country.name;
      await updateCountryStatus(slug, "generating");

      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries <= maxRetries && !success && !this.cancelled) {
        try {
          await this.generateOne(country);
          await updateCountryStatus(slug, "done");
          this.progress.completed++;
          success = true;
        } catch (err: unknown) {
          const error = err as Error & { status?: number; headers?: Record<string, string> };
          if (error.status === 429 && retries < maxRetries) {
            const retryAfter = parseInt(error.headers?.["retry-after"] || "10", 10);
            await sleep(retryAfter * 1000);
            retries++;
          } else {
            await updateCountryStatus(slug, "failed", error.message || "Unknown error");
            this.progress.failed++;
            break;
          }
        }
      }

      if (!this.cancelled && queue.indexOf(country) < queue.length - 1) {
        await sleep(3000);
      }
    }

    this.progress.running = false;
    this.progress.current = null;
    this.running = false;
  }

  cancel() {
    this.cancelled = true;
  }

  getProgress(): BatchProgress {
    return { ...this.progress };
  }

  isRunning(): boolean {
    return this.running;
  }
}

// Singleton that survives hot reload in dev
const globalForBatch = globalThis as unknown as { batchRunner: BatchRunner };
export const batchRunner = globalForBatch.batchRunner || new BatchRunner();
globalForBatch.batchRunner = batchRunner;
