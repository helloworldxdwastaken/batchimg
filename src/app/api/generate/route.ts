import { NextRequest, NextResponse } from "next/server";
import { countries, getCountrySlug } from "@/data/countries";
import { batchRunner } from "@/lib/batch-runner";
import { updateCountryStatus, getCountryState } from "@/lib/state";

export async function POST(request: NextRequest) {
  try {
    const { country, force } = await request.json();

    if (!country) {
      return NextResponse.json({ error: "Country slug is required" }, { status: 400 });
    }

    const countryData = countries.find((c) => getCountrySlug(c.name) === country);
    if (!countryData) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const slug = getCountrySlug(countryData.name);
    const currentState = getCountryState(slug);

    if (currentState.status === "done" && !force) {
      return NextResponse.json({ message: "Already generated", status: "done" });
    }

    await updateCountryStatus(slug, "generating");

    try {
      await batchRunner.generateOne(countryData);
      await updateCountryStatus(slug, "done");
      return NextResponse.json({ message: "Generated successfully", status: "done" });
    } catch (err: unknown) {
      const error = err as Error;
      await updateCountryStatus(slug, "failed", error.message);
      return NextResponse.json(
        { error: error.message, status: "failed" },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
