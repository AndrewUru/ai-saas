import { randomUUID } from "crypto";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { encrypt } from "@/lib/crypto";
import { getSiteUrlFromHeaders } from "@/lib/site";
import { createAdmin } from "@/lib/supabase/admin";
import { verifyWooAuthState } from "@/lib/woo/auth-state";
import { completeWooConnection } from "@/lib/woo/webhooks";

export const runtime = "nodejs";
export const maxDuration = 60;

const CallbackSchema = z.object({
  user_id: z.string().min(1).max(4000),
  consumer_key: z.string().regex(/^ck_\w{20,}$/),
  consumer_secret: z.string().regex(/^cs_\w{20,}$/),
});

/**
 * WooCommerce llama aquí (servidor a servidor) con las claves recién creadas
 * cuando el comerciante aprueba el acceso. Si no respondemos 200, la tienda
 * borra las claves y muestra un error.
 */
export async function POST(req: Request) {
  const parsed = CallbackSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const state = verifyWooAuthState(parsed.data.user_id);
  if (!state) {
    return NextResponse.json({ ok: false, error: "Invalid or expired state." }, { status: 401 });
  }

  const admin = createAdmin();
  const credentials = {
    ck_cipher: encrypt(parsed.data.consumer_key),
    cs_cipher: encrypt(parsed.data.consumer_secret),
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  // Reconnecting the same store refreshes its keys instead of duplicating it.
  const { data: existing } = await admin
    .from("integrations_woocommerce")
    .select("id")
    .eq("user_id", state.userId)
    .eq("store_url", state.storeUrl)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let integrationId = existing?.id as string | undefined;

  if (integrationId) {
    const { error } = await admin
      .from("integrations_woocommerce")
      .update(credentials)
      .eq("id", integrationId);
    if (error) integrationId = undefined;
  } else {
    const { data: last } = await admin
      .from("integrations_woocommerce")
      .select("position")
      .eq("user_id", state.userId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created } = await admin
      .from("integrations_woocommerce")
      .insert({
        ...credentials,
        user_id: state.userId,
        label: state.label || new URL(state.storeUrl).host,
        store_url: state.storeUrl,
        position: (last?.position ?? -1) + 1,
        webhook_token: randomUUID(),
      })
      .select("id")
      .single();
    integrationId = created?.id;
  }

  if (!integrationId) {
    console.error("[Woo] one-click connection could not be saved", { userId: state.userId });
    return NextResponse.json({ ok: false, error: "Could not save keys." }, { status: 500 });
  }

  // The store is blocked until we answer, so talk back to it only afterwards.
  const savedId = integrationId;
  const siteUrl = getSiteUrlFromHeaders(req.headers);
  after(() => completeWooConnection(savedId, siteUrl));

  return NextResponse.json({ ok: true });
}
