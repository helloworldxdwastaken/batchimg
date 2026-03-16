import { NextRequest, NextResponse } from "next/server";
import { countries } from "@/data/countries";
import { batchRunner } from "@/lib/batch-runner";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    if (batchRunner.isRunning()) {
      return NextResponse.json(
        { error: "Batch already running" },
        { status: 409 }
      );
    }

    // Start batch in background (don't await)
    batchRunner.start(countries, force).catch(console.error);

    return NextResponse.json({ message: "Batch started" }, { status: 202 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const progress = batchRunner.getProgress();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
        );
        if (!progress.running && progress.total > 0) {
          // Send one final update then close
          clearInterval(interval);
          controller.close();
        }
      };

      const interval = setInterval(send, 500);
      send(); // send immediately

      // Clean up after 30 minutes max
      setTimeout(() => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      }, 30 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
