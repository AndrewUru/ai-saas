import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { z } from "zod";

const BaseSchema = z.object({
  site_url: z.string().url().max(255),
  label: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[\p{L}0-9 \-_.]+$/u, "Etiqueta invalida"),
  consumer_key: z.string().min(10).max(255),
  consumer_secret: z.string().min(10).max(255),
  position: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

const CreateSchema = BaseSchema;

const UpdateSchema = BaseSchema.partial({
  consumer_key: true,
  consumer_secret: true,
}).extend({
  integration_id: z.string().uuid(),
});

function ok(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

function error(message: string, status = 400) {
  return ok({ ok: false, error: message }, { status });
}

export async function GET(req: Request) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return error("No autorizado", 401);

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

  const { data, error: dbError } = await supabase
    .from("integrations_woocommerce")
    .select("id, site_url, label, is_active, position, created_at, updated_at")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (dbError) {
    return error(dbError.message, 500);
  }

  return ok({ ok: true, data: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return error("No autorizado", 401);

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return error("Payload invalido");
  }

  const { site_url, label, consumer_key, consumer_secret, position, is_active } =
    parsed.data;

  const { count } = await supabase
    .from("integrations_woocommerce")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const nextPosition =
    typeof position === "number" && !Number.isNaN(position)
      ? position
      : (count ?? 0);

  const { error: insertError, data } = await supabase
    .from("integrations_woocommerce")
    .insert({
      user_id: user.id,
      site_url,
      label,
      ck_cipher: Buffer.from(encrypt(consumer_key), "utf8"),
      cs_cipher: Buffer.from(encrypt(consumer_secret), "utf8"),
      position: nextPosition,
      is_active: is_active ?? true,
    })
    .select("id")
    .single();

  if (insertError) {
    return error(insertError.message, 500);
  }

  return ok({ ok: true, integration_id: data?.id });
}

export async function PATCH(req: Request) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return error("No autorizado", 401);

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return error("Payload invalido");
  }

  const {
    integration_id,
    site_url,
    label,
    consumer_key,
    consumer_secret,
    position,
    is_active,
  } = parsed.data;

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (site_url) patch.site_url = site_url;
  if (label) patch.label = label;
  if (typeof is_active === "boolean") patch.is_active = is_active;
  if (typeof position === "number") patch.position = position;
  if (consumer_key)
    patch.ck_cipher = Buffer.from(encrypt(consumer_key), "utf8");
  if (consumer_secret)
    patch.cs_cipher = Buffer.from(encrypt(consumer_secret), "utf8");

  const { error: updateError } = await supabase
    .from("integrations_woocommerce")
    .update(patch)
    .eq("id", integration_id)
    .eq("user_id", user.id);

  if (updateError) {
    return error(updateError.message, 500);
  }

  return ok({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return error("No autorizado", 401);

  const url = new URL(req.url);
  const integrationId = url.searchParams.get("id");
  if (!integrationId) {
    return error("Falta id");
  }

  const { error: deleteError } = await supabase
    .from("integrations_woocommerce")
    .delete()
    .eq("id", integrationId)
    .eq("user_id", user.id);

  if (deleteError) {
    return error(deleteError.message, 500);
  }

  return ok({ ok: true });
}
