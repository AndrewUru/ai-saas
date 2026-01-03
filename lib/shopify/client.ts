import { createAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";

const DEFAULT_SHOPIFY_TIMEOUT_MS = 20000;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_SHOPIFY_API_VERSION = "2024-10";

export type ShopifyFetchError = Error & { status?: number; body?: string };

export function getShopifyApiVersion() {
  return process.env.SHOPIFY_API_VERSION ?? DEFAULT_SHOPIFY_API_VERSION;
}

function isValidShopDomain(host: string) {
  if (!/^[a-z0-9.-]+$/.test(host)) return false;
  if (host.endsWith(".myshopify.com")) {
    return host !== "myshopify.com";
  }
  const parts = host.split(".");
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  return tld.length >= 2;
}

export function normalizeShopDomain(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    const hasScheme = /^https?:\/\//i.test(trimmed);
    const url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");
    return isValidShopDomain(host) ? host : "";
  } catch {
    if (!/^[a-z0-9.-]+$/i.test(trimmed)) return "";
    const host = trimmed.replace(/^www\./, "");
    return isValidShopDomain(host) ? host : "";
  }
}

export function buildShopifyAdminUrl(
  shopDomain: string,
  path: string,
  params: Record<string, string | number | undefined> = {}
) {
  const cleanPath = path.replace(/^\/+/, "");
  const version = getShopifyApiVersion();
  const url = new URL(
    `https://${shopDomain}/admin/api/${version}/${cleanPath}`
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const encoded = String(value);
    if (!encoded) return;
    url.searchParams.set(key, encoded);
  });

  return url.toString();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function shopifyFetch(
  shopDomain: string,
  accessToken: string,
  path: string,
  init: RequestInit = {},
  params: Record<string, string | number | undefined> = {},
  retries = 2
) {
  let lastError: ShopifyFetchError | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        DEFAULT_SHOPIFY_TIMEOUT_MS
      );

      const res = await fetch(buildShopifyAdminUrl(shopDomain, path, params), {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
          "User-Agent": "ai-saas/1.0",
          ...(init.headers ?? {}),
        },
      });

      clearTimeout(timeout);

      if (res.ok) {
        return res;
      }

      if (RETRYABLE_STATUSES.has(res.status) && attempt < retries) {
        const retryAfter = Number(res.headers.get("retry-after") ?? 0);
        const delay =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 500 * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      const body = await res.text().catch(() => "");
      const err = new Error(
        `Shopify error ${res.status}: ${body.slice(0, 200)}`
      ) as ShopifyFetchError;
      err.status = res.status;
      err.body = body;
      throw err;
    } catch (err) {
      lastError =
        err instanceof Error
          ? (err as ShopifyFetchError)
          : new Error("Shopify request failed");
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Shopify request failed");
}

export async function getShopifyCredsByApiKey(apiKey: string) {
  const supabase = createAdmin();

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("user_id, shopify_integration_id")
    .eq("api_key", apiKey)
    .single();

  if (agentError || !agent?.shopify_integration_id) return null;

  const { data: integ } = await supabase
    .from("integrations_shopify")
    .select(
      "id, user_id, shop_domain, access_token_enc, is_active, last_sync_at, last_sync_status, products_indexed_count, currency"
    )
    .eq("id", agent.shopify_integration_id)
    .eq("user_id", agent.user_id)
    .single();

  if (!integ || !integ.is_active) return null;

  return {
    integration_id: integ.id as string,
    shop_domain: integ.shop_domain as string,
    access_token: decrypt(integ.access_token_enc as string),
    last_sync_at: integ.last_sync_at as string | null,
    last_sync_status: integ.last_sync_status as string | null,
    products_indexed_count: integ.products_indexed_count as number | null,
    currency: (integ.currency as string | null) ?? null,
  };
}
