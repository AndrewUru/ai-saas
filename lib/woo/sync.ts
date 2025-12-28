import { createAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { buildWooUrl, wooFetch } from "@/lib/woo/client";
import { embedTexts, toPgVector } from "@/lib/woo/embeddings";

type WooProductApi = {
  id: number;
  name: string;
  slug?: string;
  permalink?: string;
  price?: string;
  sku?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  categories?: Array<{ id: number; name: string; slug: string }>;
  tags?: Array<{ id: number; name: string; slug: string }>;
  attributes?: Array<{
    id: number;
    name: string;
    options: string[];
    variation: boolean;
  }>;
  short_description?: string;
  description?: string;
  images?: Array<{ id: number; src: string; alt?: string }>;
  date_modified_gmt?: string | null;
};

function buildEmbeddingText(product: WooProductApi) {
  const parts = [
    product.name,
    product.short_description,
    product.description,
    product.sku ? `SKU: ${product.sku}` : null,
    product.price ? `Price: ${product.price}` : null,
    product.categories?.length
      ? `Categories: ${product.categories.map((c) => c.name).join(", ")}`
      : null,
    product.tags?.length
      ? `Tags: ${product.tags.map((t) => t.name).join(", ")}`
      : null,
    product.attributes?.length
      ? `Attributes: ${product.attributes
          .map((attr) => `${attr.name}: ${attr.options?.join(", ") ?? ""}`)
          .join("; ")}`
      : null,
  ];

  return parts.filter(Boolean).join("\n");
}

function mapProduct(
  product: WooProductApi,
  integrationId: string,
  embedding: number[] | null
) {
  return {
    integration_id: integrationId,
    woo_product_id: product.id,
    name: product.name,
    slug: product.slug ?? null,
    permalink: product.permalink ?? null,
    price: product.price ?? null,
    sku: product.sku ?? null,
    stock_status: product.stock_status ?? null,
    stock_quantity: product.stock_quantity ?? null,
    categories: product.categories ?? null,
    tags: product.tags ?? null,
    attributes: product.attributes ?? null,
    short_description: product.short_description ?? null,
    description: product.description ?? null,
    image: product.images?.[0]?.src ?? null,
    raw: product as unknown,
    updated_at_remote: product.date_modified_gmt ?? null,
    updated_at: new Date().toISOString(),
    embedding: embedding ? toPgVector(embedding) : null,
  };
}

async function upsertProducts(
  rows: ReturnType<typeof mapProduct>[]
) {
  const supabase = createAdmin();
  if (!rows.length) return;

  const { error } = await supabase.from("woo_products").upsert(rows, {
    onConflict: "integration_id,woo_product_id",
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
    .from("integrations_woocommerce")
    .update(patch)
    .eq("id", integrationId);
}

export async function syncWooProducts(integrationId: string) {
  const supabase = createAdmin();
  const { data: integration } = await supabase
    .from("integrations_woocommerce")
    .select("id, store_url, ck_cipher, cs_cipher, is_active")
    .eq("id", integrationId)
    .single();

  if (!integration || !integration.is_active) {
    throw new Error("Integration not found or inactive.");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for embeddings.");
  }

  const ck = integration.ck_cipher ? decrypt(integration.ck_cipher) : "";
  const cs = integration.cs_cipher ? decrypt(integration.cs_cipher) : "";

  await updateSyncStatus(integrationId, {
    last_sync_status: "running",
    last_sync_error: null,
    last_sync_at: new Date().toISOString(),
  });

  let page = 1;
  let total = 0;

  try {
    while (true) {
      const url = buildWooUrl(integration.store_url, "/products", {
        per_page: 100,
        page,
        consumer_key: ck,
        consumer_secret: cs,
      });

      const res = await wooFetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      const items = (await res.json()) as WooProductApi[];
      if (!items.length) break;

      const texts = items.map(buildEmbeddingText);
      const embeddings = await embedTexts(texts, process.env.OPENAI_API_KEY);

      const rows = items.map((product, index) =>
        mapProduct(product, integrationId, embeddings[index] ?? null)
      );

      await upsertProducts(rows);
      total += items.length;
      page += 1;
    }

    const { count } = await supabase
      .from("woo_products")
      .select("id", { count: "exact", head: true })
      .eq("integration_id", integrationId);

    await updateSyncStatus(integrationId, {
      last_sync_status: "success",
      last_sync_error: null,
      last_sync_at: new Date().toISOString(),
      products_indexed_count: count ?? total,
    });

    return { indexed: count ?? total };
  } catch (err) {
    await updateSyncStatus(integrationId, {
      last_sync_status: "failed",
      last_sync_error:
        err instanceof Error ? err.message.slice(0, 300) : "Sync failed",
    });
    throw err;
  }
}

export async function syncWooProductById(
  integrationId: string,
  wooProductId: number
) {
  const supabase = createAdmin();
  const { data: integration } = await supabase
    .from("integrations_woocommerce")
    .select("id, store_url, ck_cipher, cs_cipher, is_active")
    .eq("id", integrationId)
    .single();

  if (!integration || !integration.is_active) {
    throw new Error("Integration not found or inactive.");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for embeddings.");
  }

  const ck = integration.ck_cipher ? decrypt(integration.ck_cipher) : "";
  const cs = integration.cs_cipher ? decrypt(integration.cs_cipher) : "";

  const url = buildWooUrl(integration.store_url, `/products/${wooProductId}`, {
    consumer_key: ck,
    consumer_secret: cs,
  });
  const res = await wooFetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const product = (await res.json()) as WooProductApi;
  const [embedding] = await embedTexts(
    [buildEmbeddingText(product)],
    process.env.OPENAI_API_KEY
  );

  await upsertProducts([mapProduct(product, integrationId, embedding ?? null)]);

  return product;
}

export async function deleteWooProduct(
  integrationId: string,
  wooProductId: number
) {
  const supabase = createAdmin();
  await supabase
    .from("woo_products")
    .delete()
    .eq("integration_id", integrationId)
    .eq("woo_product_id", wooProductId);
}

export async function reconcileWooProducts(integrationId: string) {
  const supabase = createAdmin();
  const { data: integration } = await supabase
    .from("integrations_woocommerce")
    .select("id, store_url, ck_cipher, cs_cipher, is_active, last_sync_at")
    .eq("id", integrationId)
    .single();

  if (!integration || !integration.is_active) {
    return { updated: 0 };
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for embeddings.");
  }

  const ck = integration.ck_cipher ? decrypt(integration.ck_cipher) : "";
  const cs = integration.cs_cipher ? decrypt(integration.cs_cipher) : "";

  const url = buildWooUrl(integration.store_url, "/products", {
    per_page: 50,
    orderby: "modified",
    order: "desc",
    modified_after: integration.last_sync_at ?? undefined,
    consumer_key: ck,
    consumer_secret: cs,
  });

  const res = await wooFetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const items = (await res.json()) as WooProductApi[];
  if (!items.length) return { updated: 0 };

  const texts = items.map(buildEmbeddingText);
  const embeddings = await embedTexts(texts, process.env.OPENAI_API_KEY);
  const rows = items.map((product, index) =>
    mapProduct(product, integrationId, embeddings[index] ?? null)
  );

  await upsertProducts(rows);

  await updateSyncStatus(integrationId, {
    last_sync_status: "success",
    last_sync_error: null,
    last_sync_at: new Date().toISOString(),
  });

  return { updated: rows.length };
}
