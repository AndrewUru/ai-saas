import { z } from "zod";
import { createAdmin } from "@/lib/supabase/admin";
import { shopifyFetch, getShopifyCredsByApiKey } from "@/lib/shopify/client";
import { embedText, toPgVector } from "@/lib/woo/embeddings";
import { syncShopifyProductById } from "@/lib/shopify/sync";

const MAX_RESULTS = 8;

const searchArgsSchema = z.object({
  query: z.string().min(1).max(200),
  require_freshness: z.boolean().optional(),
  product_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_RESULTS).optional(),
});

type ShopifyProductNode = {
  id: string;
  title?: string;
  handle?: string;
  totalInventory?: number | null;
  featuredImage?: { url?: string | null } | null;
  images?: {
    edges?: Array<{ node?: { url?: string | null } | null }>;
  } | null;
  variants?: {
    edges?: Array<{
      node?: { price?: string | null; sku?: string | null } | null;
    }>;
  } | null;
};

type ShopifySearchResult = {
  shopify_product_id: string;
  name: string;
  price: string | null;
  currency: string | null;
  stock_status: string | null;
  permalink: string | null;
  image: string | null;
  score: number | null;
};

function parseShopifyProductId(rawId: string) {
  const match = rawId.match(/\/Product\/(\d+)$/);
  return match?.[1] ?? rawId;
}

function toSearchResult(
  node: ShopifyProductNode,
  shopDomain: string,
  currency: string | null
): ShopifySearchResult | null {
  const name = typeof node.title === "string" ? node.title.trim() : "";
  if (!name) return null;

  const productId = parseShopifyProductId(node.id);
  const price =
    node.variants?.edges?.[0]?.node?.price?.toString().trim() ?? null;
  const image =
    node.featuredImage?.url ??
    node.images?.edges?.[0]?.node?.url ??
    null;

  const stock_status =
    typeof node.totalInventory === "number"
      ? node.totalInventory > 0
        ? "instock"
        : "outofstock"
      : null;

  const permalink = node.handle
    ? `https://${shopDomain}/products/${node.handle}`
    : null;

  return {
    shopify_product_id: productId,
    name,
    price: price && price.length ? price : null,
    currency,
    stock_status,
    permalink,
    image,
    score: null,
  };
}

async function searchShopifyProductsLive(
  creds: NonNullable<Awaited<ReturnType<typeof getShopifyCredsByApiKey>>>,
  query: string,
  limit: number
) {
  const queryString = query.includes(":") ? query : `title:*${query}*`;
  const graphqlQuery = `query Products($first: Int!, $query: String!) {
  products(first: $first, query: $query) {
    edges {
      node {
        id
        title
        handle
        totalInventory
        featuredImage { url }
        images(first: 1) { edges { node { url } } }
        variants(first: 1) { edges { node { price sku } } }
      }
    }
  }
}`;

  const res = await shopifyFetch(creds.shop_domain, creds.access_token, "graphql.json", {
    method: "POST",
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { first: limit, query: queryString },
    }),
  });

  const payload = await res.json().catch(() => ({}));
  const edges = payload?.data?.products?.edges;
  if (!Array.isArray(edges)) return [];

  const results: ShopifySearchResult[] = [];
  for (const edge of edges) {
    const node = edge?.node as ShopifyProductNode | undefined;
    if (!node) continue;
    const mapped = toSearchResult(node, creds.shop_domain, creds.currency ?? null);
    if (mapped) results.push(mapped);
  }

  return results;
}

async function refreshShopifyProduct(
  creds: NonNullable<Awaited<ReturnType<typeof getShopifyCredsByApiKey>>>,
  productId: string
) {
  const product = await syncShopifyProductById(
    creds.integration_id,
    productId
  );

  const name = typeof product.title === "string" ? product.title : "";
  const handle = product.handle ?? "";
  const price =
    product.variants && product.variants.length
      ? product.variants[0]?.price ?? null
      : null;
  const image = product.image?.src ?? product.images?.[0]?.src ?? null;

  const totalQty = (product.variants ?? []).reduce((sum, variant) => {
    const qty = typeof variant.inventory_quantity === "number"
      ? variant.inventory_quantity
      : 0;
    return sum + qty;
  }, 0);

  const stock_status = totalQty > 0 ? "instock" : "outofstock";

  return {
    shopify_product_id: String(product.id),
    name,
    price: price ?? null,
    currency: creds.currency ?? null,
    stock_status,
    permalink: handle ? `https://${creds.shop_domain}/products/${handle}` : null,
    image,
    score: null,
  } satisfies ShopifySearchResult;
}

export async function shopifySearchProductsByApiKey(
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

  const creds = await getShopifyCredsByApiKey(apiKey);
  if (!creds) {
    throw new Error("Shopify integration not configured.");
  }

  const hasIndex =
    creds.products_indexed_count !== null &&
    creds.products_indexed_count > 0 &&
    creds.last_sync_status === "success";

  const supabase = createAdmin();
  let results: ShopifySearchResult[] = [];

  if (hasIndex && options.openaiApiKey) {
    const embedding = await embedText(query, options.openaiApiKey);
    const { data } = await supabase.rpc("match_shopify_products", {
      query_embedding: toPgVector(embedding),
      match_count: maxResults,
      target_integration: creds.integration_id,
      match_threshold: 0.2,
    });

    results = (data ?? []).map(
      (row: ShopifySearchResult & { similarity: number }) => ({
        shopify_product_id: row.shopify_product_id,
        name: row.name,
        price: row.price ?? null,
        currency: row.currency ?? creds.currency ?? null,
        stock_status: row.stock_status ?? null,
        permalink: row.permalink ?? null,
        image: row.image ?? null,
        score: row.similarity ?? null,
      })
    );
  }

  if (!results.length) {
    results = await searchShopifyProductsLive(creds, query, maxResults);
  }

  if (require_freshness) {
    const refreshId = product_id
      ? String(product_id)
      : results[0]?.shopify_product_id;

    if (refreshId) {
      const fresh = await refreshShopifyProduct(creds, refreshId);
      results = [
        fresh,
        ...results.filter((item) => item.shopify_product_id !== refreshId),
      ].slice(0, maxResults);
    }
  }

  return results.slice(0, maxResults);
}
