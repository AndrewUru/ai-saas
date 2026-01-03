import { createAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { shopifyFetch } from "@/lib/shopify/client";
import { embedTexts, toPgVector } from "@/lib/woo/embeddings";

type ShopifyVariantApi = {
  id: number;
  price?: string;
  sku?: string;
  inventory_quantity?: number;
  inventory_management?: string | null;
};

type ShopifyProductApi = {
  id: number;
  title: string;
  handle?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: ShopifyVariantApi[];
  images?: Array<{ src?: string; alt?: string }>;
  image?: { src?: string; alt?: string };
  updated_at?: string;
};

type VariantInfo = {
  price: string | null;
  sku: string | null;
  stock_status: "instock" | "outofstock" | null;
  stock_quantity: number | null;
};

function stripHtml(input: string | null | undefined) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildEmbeddingText(product: ShopifyProductApi) {
  const description = stripHtml(product.body_html);
  const skus =
    product.variants
      ?.map((variant) => variant.sku)
      .filter(Boolean)
      .join(", ") ?? null;
  const prices =
    product.variants
      ?.map((variant) => variant.price)
      .filter(Boolean)
      .join(", ") ?? null;

  const parts = [
    product.title,
    description || null,
    product.vendor ? `Vendor: ${product.vendor}` : null,
    product.product_type ? `Type: ${product.product_type}` : null,
    product.tags ? `Tags: ${product.tags}` : null,
    skus ? `SKU: ${skus}` : null,
    prices ? `Price: ${prices}` : null,
  ];

  return parts.filter(Boolean).join("\n");
}

function extractVariantInfo(
  variants: ShopifyVariantApi[] | undefined
): VariantInfo {
  if (!variants || !variants.length) {
    return {
      price: null,
      sku: null,
      stock_status: null,
      stock_quantity: null,
    };
  }

  const priced = variants.filter(
    (variant) => typeof variant.price === "string" && variant.price.trim()
  );
  const price =
    priced.length > 0
      ? priced
          .slice()
          .sort((a, b) => Number(a.price) - Number(b.price))[0]?.price ?? null
      : null;

  const sku =
    variants.find((variant) => variant.sku && variant.sku.trim())?.sku?.trim() ??
    null;

  const quantities = variants
    .map((variant) =>
      typeof variant.inventory_quantity === "number"
        ? variant.inventory_quantity
        : null
    )
    .filter((value): value is number => value !== null);

  const totalQty = quantities.reduce((sum, value) => sum + value, 0);
  const hasInventory = quantities.length > 0;
  const tracksInventory = variants.some(
    (variant) => !!variant.inventory_management
  );

  let stock_status: "instock" | "outofstock" | null = null;
  if (tracksInventory || hasInventory) {
    stock_status = totalQty > 0 ? "instock" : "outofstock";
  }

  return {
    price,
    sku,
    stock_status,
    stock_quantity: hasInventory ? totalQty : null,
  };
}

function mapProduct(
  product: ShopifyProductApi,
  integrationId: string,
  shopDomain: string,
  currency: string | null,
  embedding: number[] | null
) {
  const variantInfo = extractVariantInfo(product.variants);
  const image = product.image?.src ?? product.images?.[0]?.src ?? null;
  const permalink = product.handle
    ? `https://${shopDomain}/products/${product.handle}`
    : null;

  return {
    integration_id: integrationId,
    shopify_product_id: String(product.id),
    name: product.title,
    handle: product.handle ?? null,
    permalink,
    price: variantInfo.price ?? null,
    currency: currency ?? null,
    sku: variantInfo.sku ?? null,
    stock_status: variantInfo.stock_status ?? null,
    stock_quantity: variantInfo.stock_quantity ?? null,
    vendor: product.vendor ?? null,
    product_type: product.product_type ?? null,
    tags: product.tags ?? null,
    description: stripHtml(product.body_html) || null,
    image,
    raw: product as unknown,
    updated_at_remote: product.updated_at ?? null,
    updated_at: new Date().toISOString(),
    embedding: embedding ? toPgVector(embedding) : null,
  };
}

async function upsertProducts(rows: ReturnType<typeof mapProduct>[]) {
  const supabase = createAdmin();
  if (!rows.length) return;

  const { error } = await supabase.from("shopify_products").upsert(rows, {
    onConflict: "integration_id,shopify_product_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function updateSyncStatus(
  integrationId: string,
  patch: Record<string, unknown>
) {
  const supabase = createAdmin();
  await supabase
    .from("integrations_shopify")
    .update(patch)
    .eq("id", integrationId);
}

function getNextPageInfo(linkHeader: string | null) {
  if (!linkHeader) return null;
  const parts = linkHeader.split(",");
  for (const part of parts) {
    const [urlPart, relPart] = part.split(";").map((value) => value.trim());
    if (!urlPart || !relPart || !relPart.includes('rel="next"')) continue;
    if (!urlPart.startsWith("<") || !urlPart.endsWith(">")) continue;
    const rawUrl = urlPart.slice(1, -1);
    try {
      const parsed = new URL(rawUrl);
      const pageInfo = parsed.searchParams.get("page_info");
      if (pageInfo) return pageInfo;
    } catch {
      // ignore
    }
  }
  return null;
}

async function resolveCurrency(shopDomain: string, accessToken: string) {
  try {
    const res = await shopifyFetch(shopDomain, accessToken, "shop.json", {
      method: "GET",
    });
    const payload = await res.json().catch(() => ({}));
    const currency =
      typeof payload?.shop?.currency === "string"
        ? payload.shop.currency
        : null;
    return currency;
  } catch {
    return null;
  }
}

export async function syncShopifyProducts(integrationId: string) {
  const supabase = createAdmin();
  const { data: integration } = await supabase
    .from("integrations_shopify")
    .select("id, shop_domain, access_token_enc, is_active, currency")
    .eq("id", integrationId)
    .single();

  if (!integration || !integration.is_active) {
    throw new Error("Integration not found or inactive.");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for embeddings.");
  }

  const accessToken = decrypt(integration.access_token_enc);

  await updateSyncStatus(integrationId, {
    last_sync_status: "running",
    last_sync_error: null,
    last_sync_at: new Date().toISOString(),
  });

  let currency = integration.currency ?? null;
  if (!currency) {
    const resolved = await resolveCurrency(integration.shop_domain, accessToken);
    if (resolved) {
      currency = resolved;
      await supabase
        .from("integrations_shopify")
        .update({
          currency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integrationId);
    }
  }

  let pageInfo: string | null = null;
  let total = 0;

  try {
    while (true) {
      const params: Record<string, string | number | undefined> = {
        limit: 250,
        status: "any",
      };
      if (pageInfo) params.page_info = pageInfo;

      const res = await shopifyFetch(
        integration.shop_domain,
        accessToken,
        "products.json",
        {
          headers: {
            Accept: "application/json",
          },
        },
        params
      );

      const payload = (await res.json()) as { products?: ShopifyProductApi[] };
      const items = payload.products ?? [];
      if (!items.length) break;

      const texts = items.map(buildEmbeddingText);
      const embeddings = await embedTexts(texts, process.env.OPENAI_API_KEY);

      const rows = items.map((product, index) =>
        mapProduct(
          product,
          integrationId,
          integration.shop_domain,
          currency,
          embeddings[index] ?? null
        )
      );

      await upsertProducts(rows);
      total += items.length;

      pageInfo = getNextPageInfo(res.headers.get("link"));
      if (!pageInfo) break;
    }

    const { count } = await supabase
      .from("shopify_products")
      .select("id", { count: "exact", head: true })
      .eq("integration_id", integrationId);

    await updateSyncStatus(integrationId, {
      last_sync_status: "success",
      last_sync_error: null,
      last_sync_at: new Date().toISOString(),
      products_indexed_count: count ?? total,
    });

    return { indexed: count ?? total, currency };
  } catch (err) {
    await updateSyncStatus(integrationId, {
      last_sync_status: "failed",
      last_sync_error:
        err instanceof Error ? err.message.slice(0, 300) : "Sync failed",
    });
    throw err;
  }
}

export async function syncShopifyProductById(
  integrationId: string,
  shopifyProductId: string | number
) {
  const supabase = createAdmin();
  const { data: integration } = await supabase
    .from("integrations_shopify")
    .select("id, shop_domain, access_token_enc, is_active, currency")
    .eq("id", integrationId)
    .single();

  if (!integration || !integration.is_active) {
    throw new Error("Integration not found or inactive.");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for embeddings.");
  }

  const accessToken = decrypt(integration.access_token_enc);
  const currency = integration.currency ?? null;

  const res = await shopifyFetch(
    integration.shop_domain,
    accessToken,
    `products/${shopifyProductId}.json`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  const payload = (await res.json()) as { product?: ShopifyProductApi };
  const product = payload.product;
  if (!product) {
    throw new Error("Product not found.");
  }

  const [embedding] = await embedTexts(
    [buildEmbeddingText(product)],
    process.env.OPENAI_API_KEY
  );

  await upsertProducts([
    mapProduct(
      product,
      integrationId,
      integration.shop_domain,
      currency,
      embedding ?? null
    ),
  ]);

  return product;
}
