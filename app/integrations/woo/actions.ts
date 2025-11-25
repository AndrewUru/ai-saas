"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServer } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";

const CreateSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Etiqueta demasiado corta")
    .max(80, "Etiqueta demasiado larga"),
  site_url: z.string().url("URL invalida").max(255),
  consumer_key: z.string().min(10).max(255),
  consumer_secret: z.string().min(10).max(255),
  is_active: z.boolean().optional(),
});

const UpdateSchema = z.object({
  integration_id: z.string().uuid(),
  label: z.string().trim().min(2).max(80),
  site_url: z.string().url().max(255),
  consumer_key: z.string().min(10).max(255).optional(),
  consumer_secret: z.string().min(10).max(255).optional(),
  is_active: z.boolean().optional(),
});

const ToggleSchema = z.object({
  integration_id: z.string().uuid(),
  state: z.enum(["activate", "deactivate"]),
});

const DeleteSchema = z.object({
  integration_id: z.string().uuid(),
});

function redirectWithStatus(status: string) {
  revalidatePath("/integrations/woo");
  redirect(`/integrations/woo?status=${status}`);
}

function redirectWithError(code: string) {
  revalidatePath("/integrations/woo");
  redirect(`/integrations/woo?error=${code}`);
}

export async function createWooIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }

    const parsed = CreateSchema.safeParse({
      label: formData.get("label"),
      site_url: formData.get("site_url"),
      consumer_key: formData.get("consumer_key"),
      consumer_secret: formData.get("consumer_secret"),
      is_active: formData.get("is_active") === "on",
    });

    if (!parsed.success) {
      return redirectWithError("invalid");
    }

    const { label, site_url, consumer_key, consumer_secret, is_active } =
      parsed.data;

    const { data: positionData } = await supabase
      .from("integrations_woocommerce")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition =
      positionData && positionData.length > 0
        ? (positionData[0].position ?? 0) + 1
        : 0;

    const { error } = await supabase.from("integrations_woocommerce").insert({
      user_id: user.id,
      label,
      site_url,
      ck_cipher: Buffer.from(encrypt(consumer_key), "utf8"),
      cs_cipher: Buffer.from(encrypt(consumer_secret), "utf8"),
      is_active: is_active ?? true,
      position: nextPosition,
    });

    if (error) {
      console.error("[Woo] insert error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("created");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[Woo] create error", err);
    redirectWithError("unexpected");
  }
}

export async function updateWooIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const consumerKeyRaw = String(formData.get("consumer_key") ?? "").trim();
    const consumerSecretRaw = String(formData.get("consumer_secret") ?? "").trim();

    const parsed = UpdateSchema.safeParse({
      integration_id: formData.get("integration_id"),
      label: formData.get("label"),
      site_url: formData.get("site_url"),
      consumer_key: consumerKeyRaw ? consumerKeyRaw : undefined,
      consumer_secret: consumerSecretRaw ? consumerSecretRaw : undefined,
      is_active: formData.get("is_active") === "on",
    });

    if (!parsed.success) {
      return redirectWithError("invalid");
    }

    const {
      integration_id,
      label,
      site_url,
      consumer_key,
      consumer_secret,
      is_active,
    } = parsed.data;

    const patch: Record<string, unknown> = {
      label,
      site_url,
      is_active,
      updated_at: new Date().toISOString(),
    };

    if (consumer_key) {
      patch.ck_cipher = Buffer.from(encrypt(consumer_key), "utf8");
    }
    if (consumer_secret) {
      patch.cs_cipher = Buffer.from(encrypt(consumer_secret), "utf8");
    }

    const { error } = await supabase
      .from("integrations_woocommerce")
      .update(patch)
      .eq("id", integration_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Woo] update error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("updated");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[Woo] update error", err);
    redirectWithError("unexpected");
  }
}

export async function setWooIntegrationState(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = ToggleSchema.safeParse({
      integration_id: formData.get("integration_id"),
      state: formData.get("state"),
    });
    if (!parsed.success) {
      return redirectWithError("invalid");
    }

    const { integration_id, state } = parsed.data;
    const nextState = state === "activate";

    const { error } = await supabase
      .from("integrations_woocommerce")
      .update({
        is_active: nextState,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Woo] state error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("updated");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[Woo] state error", err);
    redirectWithError("unexpected");
  }
}

export async function deleteWooIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = DeleteSchema.safeParse({
      integration_id: formData.get("integration_id"),
    });
    if (!parsed.success) {
      return redirectWithError("invalid");
    }

    const { error } = await supabase
      .from("integrations_woocommerce")
      .delete()
      .eq("id", parsed.data.integration_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Woo] delete error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("deleted");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[Woo] delete error", err);
    redirectWithError("unexpected");
  }
}
