import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Catálogo que usa el agente al buscar productos: Shopify si tiene una
 * integración activa, si no WooCommerce (o el catálogo demo).
 */
export async function resolveAgentCatalog(
  supabase: SupabaseClient,
  shopifyIntegrationId: string | null | undefined,
): Promise<{ catalog?: string; currency?: string }> {
  if (!shopifyIntegrationId) return {};

  const { data: shopify } = await supabase
    .from("integrations_shopify")
    .select("id, is_active, currency")
    .eq("id", shopifyIntegrationId)
    .maybeSingle();

  if (!shopify?.is_active) return {};
  return { catalog: "shopify", currency: shopify.currency ?? undefined };
}
