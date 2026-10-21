"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { parsePrice, productSchema, storeSchema } from "@/lib/commerce/catalog";
import { z } from "zod";

function finish(error?: string): never {
  revalidatePath("/dashboard/store");
  redirect(`/dashboard/store?${error ? `error=${error}` : "saved=1"}`);
}

export async function saveStore(form: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = storeSchema.safeParse({
    name: form.get("name"),
    currency: form.get("currency"),
    published: form.get("published") === "on",
  });
  if (!parsed.success) finish("invalid");
  const { error } = await supabase
    .from("native_stores")
    .upsert({ ...parsed.data, user_id: user.id }, { onConflict: "user_id" });
  finish(error ? "save" : undefined);
}

export async function saveProduct(form: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = productSchema.safeParse({
    name: form.get("name"),
    description: form.get("description"),
    category: form.get("category"),
    image_url: form.get("image_url"),
    price_cents: parsePrice(String(form.get("price") ?? "")),
    stock: form.get("stock") === "" ? NaN : Number(form.get("stock")),
    active: form.get("active") === "on",
  });
  if (!parsed.success) finish("invalid");
  const { data: store } = await supabase
    .from("native_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!store) finish("store");
  const id = String(form.get("id") ?? "");
  if (id && !z.string().uuid().safeParse(id).success) finish("invalid");
  const query = id
    ? supabase
        .from("native_products")
        .update(parsed.data)
        .eq("id", id)
        .eq("store_id", store.id)
    : supabase
        .from("native_products")
        .insert({ ...parsed.data, store_id: store.id });
  const { error, data } = await query.select("id").single();
  finish(error || !data ? "save" : undefined);
}

export async function deleteProduct(form: FormData) {
  const { supabase, user } = await requireUser();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) finish("invalid");
  const { data: store } = await supabase
    .from("native_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!store) finish("store");
  const { error } = await supabase
    .from("native_products")
    .delete()
    .eq("id", id.data)
    .eq("store_id", store.id);
  finish(error ? "save" : undefined);
}

export async function linkAgent(form: FormData) {
  const { supabase, user } = await requireUser();
  const id = z.string().uuid().safeParse(form.get("agent_id"));
  if (!id.success) finish("invalid");
  const { data: store } = await supabase
    .from("native_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!store) finish("store");
  const { error, data } = await supabase
    .from("agents")
    .update({ native_store_id: form.get("unlink") === "1" ? null : store.id })
    .eq("id", id.data)
    .eq("user_id", user.id)
    .select("id")
    .single();
  finish(error || !data ? "save" : undefined);
}
