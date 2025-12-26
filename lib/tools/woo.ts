import { z } from "zod";
import { createAdmin } from "@/lib/supabase/admin";
import {
  buildWooAuthHeaders,
  buildWooUrl,
  getWooCredsByApiKey,
  wooFetch,
} from "@/lib/woo/client";
import { embedText, toPgVector } from "@/lib/woo/embeddings";
import { syncWooProductById } from "@/lib/woo/sync";

const MAX_RESULTS = 8;

const searchArgsSchema = z.object({
  query: z.string().min(1).max(200),
  require_freshness: z.boolean().optional(),
  product_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_RESULTS).optional(),
});

type WooProductApi = {
  id: number;
  name: string;
  price?: string;
  permalink?: string;
  stock_status?: string;
  images?: Array<{ src: string }>;
};

type WooSearchResult = {
  woo_product_id: number;
  name: string;
  price: string | null;
  stock_status: string | null;
  permalink: string | null;
  image: string | null;
  score: number | null;
};

function toSearchResult(
  product: WooProductApi,
  score: number | null
): WooSearchResult {
  return {
    woo_product_id: product.id,
    name: product.name,
    price: product.price ?? null,
    stock_status: product.stock_status ?? null,
    permalink: product.permalink ?? null,
    image: product.images?.[0]?.src ?? null,
    score,
  };
}

async function searchWooProductsLive(
  creds: NonNullable<Awaited<ReturnType<typeof getWooCredsByApiKey>>>,
  query: string,
  limit: number
) {
  const url = buildWooUrl(creds.store_url, "/products", {
    search: query,
    per_page: limit,
  });

  const res = await wooFetch(url, {
    headers: {
      Accept: "application/json",
      ...buildWooAuthHeaders(creds.ck, creds.cs),
    },
  });

  const items = (await res.json()) as WooProductApi[];
  return items.map((product) => toSearchResult(product, null));
}

async function refreshWooProduct(
  creds: NonNullable<Awaited<ReturnType<typeof getWooCredsByApiKey>>>,
  productId: number
) {
  const url = buildWooUrl(creds.store_url, `/products/${productId}`);
  const res = await wooFetch(url, {
    headers: {
      Accept: "application/json",
      ...buildWooAuthHeaders(creds.ck, creds.cs),
    },
  });

  const product = (await res.json()) as WooProductApi;
  await syncWooProductById(creds.integration_id, product.id);
  return toSearchResult(product, null);
}

export async function wooSearchProductsByApiKey(
  apiKey: string,
  args: unknown,
  options: { openaiApiKey: string }
) {
  const parsed = searchArgsSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error("Invalid search arguments.");
  }

  const { query, require_freshness, product_id, limit } = parsed.data;
  const maxResults = limit ?? MAX_RESULTS;

  const creds = await getWooCredsByApiKey(apiKey);
  if (!creds) {
    throw new Error("Woo integration not configured.");
  }

  const hasIndex =
    creds.products_indexed_count !== null &&
    creds.products_indexed_count > 0 &&
    creds.last_sync_status === "success";

  const supabase = createAdmin();
  let results: WooSearchResult[] = [];

  if (hasIndex && options.openaiApiKey) {
    const embedding = await embedText(query, options.openaiApiKey);
    const { data } = await supabase.rpc("match_woo_products", {
      query_embedding: toPgVector(embedding),
      match_count: maxResults,
      target_integration: creds.integration_id,
      match_threshold: 0.2,
    });

    results = (data ?? []).map(
      (row: WooSearchResult & { similarity: number }) => ({
        woo_product_id: row.woo_product_id,
        name: row.name,
        price: row.price ?? null,
        stock_status: row.stock_status ?? null,
        permalink: row.permalink ?? null,
        image: row.image ?? null,
        score: row.similarity ?? null,
      })
    );
  }

  if (!results.length) {
    results = await searchWooProductsLive(creds, query, maxResults);
  }

  if (require_freshness) {
    const refreshId = product_id ?? results[0]?.woo_product_id;
    if (refreshId) {
      const fresh = await refreshWooProduct(creds, refreshId);
      results = [
        fresh,
        ...results.filter((item) => item.woo_product_id !== refreshId),
      ].slice(0, maxResults);
    }
  }

  return results.slice(0, maxResults);
}
