import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import {
  ensureDomainAllowed,
  resolveRequestHost,
} from "@/lib/security/domains";
import { PUBLIC_PRODUCT_FIELDS } from "@/lib/commerce/catalog";

export const dynamic = "force-dynamic";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const offset = Number(url.searchParams.get("offset") ?? 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000)
    return NextResponse.json(
      { error: "Invalid offset" },
      { status: 400, headers },
    );
  if (!key || key.length > 200)
    return NextResponse.json(
      { error: "Missing key" },
      { status: 400, headers },
    );
  const db = createAdmin();
  const { data: agent, error: agentError } = await db
    .from("agents")
    .select("id, user_id, is_active, allowed_domains, native_store_id")
    .eq("api_key", key)
    .maybeSingle();
  if (agentError)
    return NextResponse.json(
      { error: "Store unavailable" },
      { status: 503, headers },
    );
  if (!agent?.is_active)
    return NextResponse.json(
      { error: "Agent unavailable" },
      { status: 404, headers },
    );
  try {
    ensureDomainAllowed(agent, resolveRequestHost(request));
  } catch {
    return NextResponse.json(
      { error: "Domain not allowed" },
      { status: 403, headers },
    );
  }
  if (!agent.native_store_id)
    return NextResponse.json({ store: null, products: [] }, { headers });
  const { data: store, error } = await db
    .from("native_stores")
    .select("id, name, currency")
    .eq("id", agent.native_store_id)
    .eq("user_id", agent.user_id)
    .eq("published", true)
    .maybeSingle();
  if (error)
    return NextResponse.json(
      { error: "Store unavailable" },
      { status: 503, headers },
    );
  if (!store)
    return NextResponse.json({ store: null, products: [] }, { headers });
  const { data: products, error: productError } = await db
    .from("native_products")
    .select(PUBLIC_PRODUCT_FIELDS)
    .eq("store_id", store.id)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .order("id")
    .range(offset, offset + 99);
  if (productError)
    return NextResponse.json(
      { error: "Catalog unavailable" },
      { status: 503, headers },
    );
  return NextResponse.json(
    {
      store,
      products,
      nextOffset: products?.length === 100 ? offset + 100 : null,
      checkout: { available: false },
    },
    { headers },
  );
}
