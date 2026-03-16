import { NextRequest, NextResponse } from "next/server";
import { getPromptTemplate, savePromptTemplate } from "@/lib/state";

export async function GET() {
  return NextResponse.json({ template: getPromptTemplate() });
}

export async function PUT(request: NextRequest) {
  try {
    const { template } = await request.json();
    if (!template || typeof template !== "string") {
      return NextResponse.json({ error: "Template is required" }, { status: 400 });
    }
    savePromptTemplate(template);
    return NextResponse.json({ message: "Template saved" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
