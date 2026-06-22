import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  try {
    const source = await readFile(
      path.join(process.cwd(), "node_modules", "three", "build", "three.module.min.js"),
      "utf8",
    );

    return new NextResponse(source, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8",
      },
    });
  } catch {
    return new NextResponse("// Three.js module not available", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/javascript; charset=utf-8",
      },
      status: 404,
    });
  }
}
