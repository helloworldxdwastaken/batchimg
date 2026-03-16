import fs from "fs";
import path from "path";
import { AppState, CountryState, CountryStatus } from "@/types";
import { DEFAULT_PROMPT_TEMPLATE } from "./prompt";

const STATE_FILE = path.join(process.cwd(), "data", "state.json");
const PROMPT_FILE = path.join(process.cwd(), "data", "prompt-template.txt");

let writeLock = false;

function ensureDataDir() {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getState(): AppState {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      countries: {},
      promptTemplate: getPromptTemplate(),
    };
  }
}

async function acquireLock(): Promise<void> {
  while (writeLock) {
    await new Promise((r) => setTimeout(r, 10));
  }
  writeLock = true;
}

function releaseLock() {
  writeLock = false;
}

export async function saveState(state: AppState): Promise<void> {
  ensureDataDir();
  await acquireLock();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } finally {
    releaseLock();
  }
}

export async function updateCountryStatus(
  slug: string,
  status: CountryStatus,
  error?: string
): Promise<void> {
  const state = getState();
  const existing = state.countries[slug] || {};
  const updated: CountryState = {
    ...existing,
    status,
    error: status === "failed" ? error : undefined,
    ...(status === "done" ? { generatedAt: new Date().toISOString() } : {}),
  };
  state.countries[slug] = updated;
  await saveState(state);
}

export function getCountryState(slug: string): CountryState {
  const state = getState();
  return state.countries[slug] || { status: "pending" };
}

export function getPromptTemplate(): string {
  ensureDataDir();
  try {
    return fs.readFileSync(PROMPT_FILE, "utf-8");
  } catch {
    fs.writeFileSync(PROMPT_FILE, DEFAULT_PROMPT_TEMPLATE);
    return DEFAULT_PROMPT_TEMPLATE;
  }
}

export function savePromptTemplate(template: string): void {
  ensureDataDir();
  fs.writeFileSync(PROMPT_FILE, template);
}

export function setCountryReferenceImage(slug: string, refPath: string): void {
  const state = getState();
  if (!state.countries[slug]) {
    state.countries[slug] = { status: "pending" };
  }
  state.countries[slug].referenceImage = refPath;
  saveState(state);
}
