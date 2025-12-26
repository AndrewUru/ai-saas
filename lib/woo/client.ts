import { createAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";

const DEFAULT_WOO_TIMEOUT_MS = 20000;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export function normalizeWooStoreUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    const hasScheme = /^https?:\/\//i.test(trimmed);
    const url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    const protocol = url.protocol === "http:" ? "http:" : "https:";
    const host = url.host.replace(/^www\./i, "").toLowerCase();
    const normalized = `${protocol}//${host}${url.pathname}`.replace(/\/$/, "");
    return normalized;
  } catch {
    return "";
  }
}

export function buildWooUrl(
  base: string,
  path: string,
  params: Record<string, string | number | undefined> = {}
) {
  const validBase = base.endsWith("/") ? base : `${base}/`;
  const relativePath = `wp-json/wc/v3${path}`.replace(/^\//, "");
  const url = new URL(relativePath, validBase);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export function buildWooAuthHeaders(ck: string, cs: string) {
  const token = Buffer.from(`${ck}:${cs}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function wooFetch(
  url: string,
  init: RequestInit = {},
  retries = 3
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        DEFAULT_WOO_TIMEOUT_MS
      );

      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        return res;
      }

      if (RETRYABLE_STATUSES.has(res.status) && attempt < retries) {
        const retryAfter = Number(res.headers.get("retry-after") ?? 0);
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 500 * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      const body = await res.text().catch(() => "");
      throw new Error(`Woo error ${res.status}: ${body.slice(0, 200)}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Woo request failed");
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Woo request failed");
}

export async function getWooIntegrationById(integrationId: string) {
  const supabase = createAdmin();
  const { data, error } = await supabase
    .from("integrations_woocommerce")
    .select(
      "id, user_id, store_url, ck_cipher, cs_cipher, is_active, last_sync_at, last_sync_status, products_indexed_count, webhook_token, webhook_secret"
    )
    .eq("id", integrationId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    store_url: data.store_url,
    ck: decrypt(data.ck_cipher),
    cs: decrypt(data.cs_cipher),
    is_active: data.is_active,
    last_sync_at: data.last_sync_at as string | null,
    last_sync_status: data.last_sync_status as string | null,
    products_indexed_count: data.products_indexed_count as number | null,
    webhook_token: data.webhook_token as string | null,
    webhook_secret: data.webhook_secret as string | null,
  };
}

export async function getWooCredsByApiKey(api_key: string) {
  const supabase = createAdmin();
  const { data: agent } = await supabase
    .from("agents")
    .select("user_id, woo_integration_id")
    .eq("api_key", api_key)
    .single();
  if (!agent?.woo_integration_id) return null;

  const { data: integ } = await supabase
    .from("integrations_woocommerce")
    .select(
      "id, user_id, store_url, ck_cipher, cs_cipher, is_active, last_sync_at, last_sync_status, products_indexed_count"
    )
    .eq("id", agent.woo_integration_id)
    .eq("user_id", agent.user_id)
    .single();
  if (!integ || !integ.is_active) return null;

  return {
    integration_id: integ.id as string,
    store_url: integ.store_url as string,
    ck: decrypt(integ.ck_cipher),
    cs: decrypt(integ.cs_cipher),
    last_sync_at: integ.last_sync_at as string | null,
    last_sync_status: integ.last_sync_status as string | null,
    products_indexed_count: integ.products_indexed_count as number | null,
  };
}
