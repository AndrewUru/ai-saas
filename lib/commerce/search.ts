import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const argsSchema = z.object({
  query: z.string().trim().max(200),
  limit: z.coerce.number().int().min(1).max(8).optional(),
});

export async function searchNativeProducts(
  db: SupabaseClient,
  storeId: string,
  userId: string,
  rawArgs: unknown,
) {
  const args = argsSchema.parse(rawArgs);
  const { data: store, error } = await db
    .from("native_stores")
    .select("id, currency")
    .eq("id", storeId)
    .eq("user_id", userId)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error("Native store unavailable");
  if (!store) return [];
  let query = db
    .from("native_products")
    .select("id, name, price_cents, stock, image_url, category")
    .eq("store_id", store.id)
    .eq("active", true);
  if (args.query)
    query = query.textSearch(
      "search_document",
      args.query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      { type: "websearch", config: "simple" },
    );
  const { data: products, error: productError } = await query
    .order("created_at", { ascending: false })
    .limit(args.limit ?? 6);
  if (productError) throw new Error("Native catalog unavailable");
  return (products ?? []).map((product) => ({
    id: product.id as string,
    name: product.name as string,
    price: (product.price_cents / 100).toFixed(2),
    currency: store.currency as string,
    stock_status: product.stock > 0 ? "instock" : "outofstock",
    image: product.image_url as string,
    permalink: null,
    categories: product.category ? [product.category as string] : null,
    score: null,
    native_product: true,
  }));
}
