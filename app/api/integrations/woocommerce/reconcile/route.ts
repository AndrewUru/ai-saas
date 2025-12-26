import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { reconcileWooProducts } from "@/lib/woo/sync";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function jsonOk(payload: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...payload });
}

function isAuthorized(req: Request) {
  const secret =
    process.env.INTEGRATIONS_RECONCILE_SECRET ??
    process.env.INTEGRATIONS_SYNC_SECRET;
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

  const supabase = createAdmin();

  if (integrationId && typeof integrationId === "string") {
    try {
      const result = await reconcileWooProducts(integrationId);
      return jsonOk({ integration_id: integrationId, ...result });
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "Reconcile failed",
        500
      );
    }
  }

  const { data: integrations } = await supabase
    .from("integrations_woocommerce")
    .select("id")
    .eq("is_active", true);

  const results = [];
  for (const integration of integrations ?? []) {
    try {
      const result = await reconcileWooProducts(integration.id);
      results.push({ integration_id: integration.id, ...result });
    } catch (err) {
      results.push({
        integration_id: integration.id,
        error: err instanceof Error ? err.message : "Reconcile failed",
      });
    }
  }

  return jsonOk({ results });
}
