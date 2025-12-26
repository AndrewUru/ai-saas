import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdmin } from "@/lib/supabase/admin";
import { deleteWooProduct, syncWooProductById } from "@/lib/woo/sync";

function jsonOk(payload: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...payload });
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function verifySignature(
  secret: string,
  payload: string,
  signatureHeader: string | null
) {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const integrationId = url.searchParams.get("integration_id");
  const token = url.searchParams.get("token");

  if (!integrationId || !token) {
    return jsonError("Missing integration token.", 401);
  }

  const supabase = createAdmin();
  const { data: integration } = await supabase
    .from("integrations_woocommerce")
    .select("id, is_active, webhook_token, webhook_secret")
    .eq("id", integrationId)
    .single();

  if (!integration || !integration.is_active) {
    return jsonError("Integration not found.", 404);
  }

  if (integration.webhook_token !== token) {
    return jsonError("Invalid token.", 401);
  }

  const rawBody = await req.text();
  if (integration.webhook_secret) {
    const signature = req.headers.get("x-wc-webhook-signature");
    const ok = verifySignature(integration.webhook_secret, rawBody, signature);
    if (!ok) {
      return jsonError("Invalid signature.", 401);
    }
  }

  try {
    const topic = req.headers.get("x-wc-webhook-topic") ?? "";
    let payload: Record<string, unknown> | null = null;
    try {
      payload = rawBody
        ? (JSON.parse(rawBody) as Record<string, unknown>)
        : null;
    } catch {
      return jsonError("Invalid payload.", 400);
    }
    const productId =
      payload && typeof payload.id === "number"
        ? payload.id
        : Number(payload?.id ?? 0);

    if (!productId || !topic.startsWith("product.")) {
      return jsonOk({ ignored: true });
    }

    if (topic === "product.deleted") {
      await deleteWooProduct(integrationId, productId);
      return jsonOk({ deleted: productId });
    }

    await syncWooProductById(integrationId, productId);
    return jsonOk({ updated: productId });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Webhook failed",
      500
    );
  }
}
