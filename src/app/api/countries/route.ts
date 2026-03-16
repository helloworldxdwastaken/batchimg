import { NextResponse } from "next/server";
import { countries, getCountrySlug } from "@/data/countries";
import { getState } from "@/lib/state";
import { CountryWithState } from "@/types";

export async function GET() {
  const state = getState();

  const result: CountryWithState[] = countries.map((c) => {
    const slug = getCountrySlug(c.name);
    return {
      ...c,
      slug,
      state: state.countries[slug] || { status: "pending" as const },
    };
  });

  return NextResponse.json(result);
}
