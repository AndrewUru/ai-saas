import { NextResponse } from "next/server";
import { syncShopifyProducts } from "@/lib/shopify/sync";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function jsonOk(payload: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...payload });
}

function isAuthorized(req: Request) {
  const secret = process.env.INTEGRATIONS_SYNC_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return jsonError("Unauthorized", 401);
  }

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const integrationId =
    body.integration_id ?? url.searchParams.get("integration_id");

  if (!integrationId || typeof integrationId !== "string") {
    return jsonError("Missing integration_id");
  }

  try {
    const result = await syncShopifyProducts(integrationId);
    return jsonOk({ integration_id: integrationId, ...result });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Sync failed", 500);
  }
}
