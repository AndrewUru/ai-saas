// lib/tools/woo.ts
import { decrypt } from "@/lib/crypto";
import { createServer } from "@/lib/supabase/server";

function buildWooUrl(
  base: string,
  path: string,
  params: Record<string, string>
) {
  // Ensure base ends with slash to treat it as a directory for relative path resolution
  const validBase = base.endsWith("/") ? base : `${base}/`;
  // Relative path to append (no leading slash)
  const relativePath = `wp-json/wc/v3${path}`.replace(/^\//, "");
  
  const url = new URL(relativePath, validBase);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

/**
 * Obtiene credenciales Woo para el agente identificado por api_key
 */
export async function getWooCredsByApiKey(api_key: string) {
  const supabase = await createServer();
  // 1) agent -> woo_integration_id
  const { data: agent } = await supabase
    .from("agents")
    .select("user_id, woo_integration_id")
    .eq("api_key", api_key)
    .single();
  if (!agent?.woo_integration_id) return null;

  // 2) integration -> site_url + ck/cs
  const { data: integ } = await supabase
    .from("integrations_woocommerce")
    .select("site_url, ck_cipher, cs_cipher, is_active")
    .eq("id", agent.woo_integration_id)
    .eq("user_id", agent.user_id)
    .single();
  if (!integ || !integ.is_active) return null;

  return {
    site_url: integ.site_url,
    ck: decrypt(integ.ck_cipher),
    cs: decrypt(integ.cs_cipher),
  };
}

export async function wooSearchProductsByApiKey(
  api_key: string,
  query: string,
  perPage = 5
) {
  const creds = await getWooCredsByApiKey(api_key);
  if (!creds) throw new Error("Integración Woo no configurada");

  const url = buildWooUrl(creds.site_url, "/products", {
    search: query,
    per_page: String(perPage),
    consumer_key: creds.ck,
    consumer_secret: creds.cs,
  });

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  
  if (!res.ok) {
    const body = await res.text();
    console.error(`[Woo] Error ${res.status} at ${url}:`, body);
    throw new Error(`Woo error ${res.status}: ${body.slice(0, 100)}`);
  }

  type WooProductApi = {
    id: number;
    name: string;
    price: string;
    permalink: string;
    stock_status: string;
  };

  const items = (await res.json()) as WooProductApi[];
  return items.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    permalink: product.permalink,
    stock_status: product.stock_status,
  }));
}
