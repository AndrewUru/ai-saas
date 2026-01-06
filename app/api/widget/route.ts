import { NextResponse } from "next/server";
import { renderWidgetScript } from "@/lib/widget/clientScript";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new NextResponse("// Missing key", {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    });
  }

  // Preview Mode: We allow overrides from query params for the Designer
  // Production Mode: We strictly use the key and fetch config from /api/widget/config
  const isPreview = url.searchParams.get("preview") === "1";
  
  // Create a minimal config object just to kickstart the client script
  // The client script will now handle fetching the full config.
  // Unless it's preview, where we might pass some overrides directly.
  
  // Pass overrides if preview
  const overrides = isPreview ? Object.fromEntries(url.searchParams.entries()) : {};
  
  const js = renderWidgetScript(key, url.origin, overrides);

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

