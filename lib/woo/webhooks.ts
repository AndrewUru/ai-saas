import { randomBytes } from "crypto";
import { createAdmin } from "@/lib/supabase/admin";
import { buildWooUrl, getWooIntegrationById, wooFetch } from "@/lib/woo/client";
import { syncWooProducts } from "@/lib/woo/sync";

const WEBHOOK_PATH = "/api/integrations/woocommerce/webhook";
const PRODUCT_TOPICS = ["product.created", "product.updated", "product.deleted"];

type WooWebhook = { id: number; delivery_url?: string | null };

/**
 * Registra en la tienda los webhooks de productos que mantienen el catálogo al
 * día. Sustituye los de conexiones anteriores de esta integración.
 */
export async function registerWooWebhooks(integrationId: string, siteUrl: string) {
  const integration = await getWooIntegrationById(integrationId);
  if (!integration?.webhook_token) throw new Error("Woo integration not found.");

  const auth = { consumer_key: integration.ck, consumer_secret: integration.cs };
  const deliveryUrl = `${siteUrl}${WEBHOOK_PATH}?integration_id=${integration.id}&token=${integration.webhook_token}`;

  const listRes = await wooFetch(
    buildWooUrl(integration.store_url, "/webhooks", { per_page: 100, ...auth }),
    { headers: { Accept: "application/json" } },
  );
  const hooks = (await listRes.json()) as WooWebhook[];
  const previous = hooks.filter(
    (hook) =>
      hook.delivery_url?.includes(WEBHOOK_PATH) &&
      hook.delivery_url.includes(`integration_id=${integration.id}`),
  );

  for (const hook of previous) {
    await wooFetch(
      buildWooUrl(integration.store_url, `/webhooks/${hook.id}`, { force: "true", ...auth }),
      { method: "DELETE" },
      0,
    );
  }

  // Saved before creating the webhooks so their first deliveries already verify.
  const secret = randomBytes(32).toString("hex");
  const { error } = await createAdmin()
    .from("integrations_woocommerce")
    .update({ webhook_secret: secret })
    .eq("id", integration.id);
  if (error) throw new Error(`Could not save webhook secret: ${error.message}`);

  for (const topic of PRODUCT_TOPICS) {
    await wooFetch(
      buildWooUrl(integration.store_url, "/webhooks", auth),
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: `AI Commerce Agents: ${topic}`,
          topic,
          delivery_url: deliveryUrl,
          secret,
          status: "active",
        }),
      },
      0,
    );
  }
}

/** Pasos posteriores a recibir las claves: webhooks y primera sincronización. */
export async function completeWooConnection(integrationId: string, siteUrl: string) {
  try {
    await registerWooWebhooks(integrationId, siteUrl);
  } catch (err) {
    console.error(
      "[Woo] webhook registration failed:",
      err instanceof Error ? err.message : err,
    );
  }

  try {
    await syncWooProducts(integrationId);
  } catch (err) {
    // syncWooProducts already stores the error on the integration.
    console.error("[Woo] initial sync failed:", err instanceof Error ? err.message : err);
  }
}
