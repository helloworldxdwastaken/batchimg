export type CountryStatus = "pending" | "generating" | "done" | "failed";

export interface CountryData {
  name: string;
  code: string;
  emoji: string;
  landmark: string;
  icon: string;
  region: string;
}

export interface CountryState {
  status: CountryStatus;
  generatedAt?: string;
  error?: string;
  referenceImage?: string;
}

export interface AppState {
  countries: Record<string, CountryState>;
  promptTemplate: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
  running: boolean;
}

export interface CountryWithState extends CountryData {
  slug: string;
  state: CountryState;
}
