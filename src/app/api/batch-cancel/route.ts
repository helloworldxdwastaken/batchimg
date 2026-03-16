import { NextResponse } from "next/server";
import { batchRunner } from "@/lib/batch-runner";

export async function POST() {
  if (!batchRunner.isRunning()) {
    return NextResponse.json({ message: "No batch running" });
  }
  batchRunner.cancel();
  return NextResponse.json({ message: "Batch cancellation requested" });
}
