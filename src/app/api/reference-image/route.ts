import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { setCountryReferenceImage } from "@/lib/state";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const country = formData.get("country") as string;
    const file = formData.get("image") as File;

    if (!country || !file) {
      return NextResponse.json(
        { error: "Country slug and image file are required" },
        { status: 400 }
      );
    }

    const refDir = path.join(process.cwd(), "public", "references");
    fs.mkdirSync(refDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";
    const filePath = path.join(refDir, `${country}.${ext}`);
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/references/${country}.${ext}`;
    setCountryReferenceImage(country, publicPath);

    return NextResponse.json({ message: "Reference uploaded", path: publicPath });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
