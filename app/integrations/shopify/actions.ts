"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServer } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import {
  normalizeShopDomain,
  shopifyFetch,
  type ShopifyFetchError,
} from "@/lib/shopify/client";
import { syncShopifyProducts } from "@/lib/shopify/sync";

// =====================
// SCHEMAS
// =====================
const CreateSchema = z.object({
  label: z.string().trim().min(2).max(80),
  shop_domain: z.string().trim().min(3).max(255),
  is_active: z.boolean().optional(),
});

const UpdateSchema = z.object({
  integration_id: z.string().uuid(),
  label: z.string().trim().min(2).max(80),
  shop_domain: z.string().trim().min(3).max(255),
  is_active: z.boolean().optional(),
});

const ToggleSchema = z.object({
  integration_id: z.string().uuid(),
  state: z.enum(["activate", "deactivate"]),
});

const DeleteSchema = z.object({
  integration_id: z.string().uuid(),
});

const TestSchema = z.object({
  integration_id: z.string().uuid(),
});

const SyncSchema = z.object({
  integration_id: z.string().uuid(),
});

// =====================
// HELPERS
// =====================
function redirectWithStatus(status: string) {
  revalidatePath("/integrations/shopify");
  redirect(`/integrations/shopify?status=${status}`);
}

function redirectWithError(code: string) {
  revalidatePath("/integrations/shopify");
  redirect(`/integrations/shopify?error=${code}`);
}

function handleRedirectError(err: unknown) {
  if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
    throw err;
  }
}

// =====================
// CREATE
// =====================
export async function createShopifyIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = CreateSchema.safeParse({
      label: formData.get("label"),
      shop_domain: formData.get("shop_domain"),
      is_active: formData.get("is_active") === "on",
    });
    if (!parsed.success) return redirectWithError("invalid");

    const { label, shop_domain, is_active } = parsed.data;
    const normalizedShopDomain = normalizeShopDomain(shop_domain);
    if (!normalizedShopDomain) return redirectWithError("invalid");

    const params = new URLSearchParams({
      shop: normalizedShopDomain,
      label,
    });
    if (typeof is_active === "boolean") {
      params.set("is_active", is_active ? "true" : "false");
    }

    redirect(`/api/integrations/shopify/auth/start?${params.toString()}`);
  } catch (err) {
    handleRedirectError(err);
    console.error("[Shopify] create error", err);
    redirectWithError("unexpected");
  }
}

// =====================
// UPDATE
// =====================
export async function updateShopifyIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = UpdateSchema.safeParse({
      integration_id: formData.get("integration_id"),
      label: formData.get("label"),
      shop_domain: formData.get("shop_domain"),
      is_active: formData.get("is_active") === "on",
    });
    if (!parsed.success) return redirectWithError("invalid");

    const { integration_id, label, shop_domain, is_active } = parsed.data;
    const normalizedShopDomain = normalizeShopDomain(shop_domain);
    if (!normalizedShopDomain) return redirectWithError("invalid");

    const { data: integration } = await supabase
      .from("integrations_shopify")
      .select("id, shop_domain")
      .eq("id", integration_id)
      .eq("user_id", user.id)
      .single();

    if (!integration) return redirectWithError("invalid");

    if (integration.shop_domain !== normalizedShopDomain) {
      const params = new URLSearchParams({
        shop: normalizedShopDomain,
        label,
        integration_id,
      });
      if (typeof is_active === "boolean") {
        params.set("is_active", is_active ? "true" : "false");
      }
      redirect(`/api/integrations/shopify/auth/start?${params.toString()}`);
    }

    const { error } = await supabase
      .from("integrations_shopify")
      .update({
        label,
        shop_domain: normalizedShopDomain,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Shopify] update error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("updated");
  } catch (err) {
    handleRedirectError(err);
    console.error("[Shopify] update error", err);
    redirectWithError("unexpected");
  }
}

// =====================
// TOGGLE
// =====================
export async function setShopifyIntegrationState(formData: FormData) {
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
    if (!parsed.success) return redirectWithError("invalid");

    const { integration_id, state } = parsed.data;

    const { error } = await supabase
      .from("integrations_shopify")
      .update({
        is_active: state === "activate",
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Shopify] state error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("updated");
  } catch (err) {
    handleRedirectError(err);
    console.error("[Shopify] state error", err);
    redirectWithError("unexpected");
  }
}

// =====================
// DELETE
// =====================
export async function deleteShopifyIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = DeleteSchema.safeParse({
      integration_id: formData.get("integration_id"),
    });
    if (!parsed.success) return redirectWithError("invalid");

    const { error } = await supabase
      .from("integrations_shopify")
      .delete()
      .eq("id", parsed.data.integration_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Shopify] delete error", error);
      return redirectWithError("db");
    }

    redirectWithStatus("deleted");
  } catch (err) {
    handleRedirectError(err);
    console.error("[Shopify] delete error", err);
    redirectWithError("unexpected");
  }
}

// =====================
// TEST CONNECTION
// =====================
export async function testShopifyIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = TestSchema.safeParse({
      integration_id: formData.get("integration_id"),
    });
    if (!parsed.success) return redirectWithError("invalid");

    const { data: integration } = await supabase
      .from("integrations_shopify")
      .select("id, shop_domain, access_token_enc")
      .eq("id", parsed.data.integration_id)
      .eq("user_id", user.id)
      .single();

    if (!integration) return redirectWithError("invalid");

    const token = decrypt(integration.access_token_enc);

    const res = await shopifyFetch(integration.shop_domain, token, "shop.json", {
      method: "GET",
    });

    const payload = await res.json().catch(() => ({}));
    const currency =
      typeof payload?.shop?.currency === "string"
        ? payload.shop.currency
        : null;

    if (currency) {
      await supabase
        .from("integrations_shopify")
        .update({
          currency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id)
        .eq("user_id", user.id);
    }

    revalidatePath("/integrations/shopify");
    redirect("/integrations/shopify?status=test_ok");
  } catch (err) {
    handleRedirectError(err);

    const status =
      typeof (err as ShopifyFetchError)?.status === "number"
        ? (err as ShopifyFetchError).status
        : null;
    const body = (err as ShopifyFetchError)?.body ?? "";
    let code = "";
    if (body) {
      try {
        const parsed = JSON.parse(body);
        code =
          typeof parsed?.error === "string"
            ? parsed.error
            : typeof parsed?.errors === "string"
            ? parsed.errors
            : "";
      } catch {
        // ignore
      }
    }

    if (status) {
      const params = new URLSearchParams({
        error: "sync_failed",
        status: String(status),
      });
      if (code) params.set("code", code);
      redirect(`/integrations/shopify?${params.toString()}`);
    }

    console.error("[Shopify] test error", err);
    redirectWithError("unexpected");
  }
}

// =====================
// SYNC PRODUCTS
// =====================
export async function syncShopifyIntegration(formData: FormData) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const parsed = SyncSchema.safeParse({
      integration_id: formData.get("integration_id"),
    });
    if (!parsed.success) return redirectWithError("invalid");

    const { data: integration } = await supabase
      .from("integrations_shopify")
      .select("id")
      .eq("id", parsed.data.integration_id)
      .eq("user_id", user.id)
      .single();

    if (!integration) return redirectWithError("invalid");

    await syncShopifyProducts(integration.id);
    revalidatePath("/integrations/shopify");
    redirect(`/integrations/shopify?status=sync_ok&sync_id=${integration.id}`);
  } catch (err) {
    handleRedirectError(err);
    console.error("[Shopify] sync error", err);
    redirect(
      `/integrations/shopify?error=sync_failed&sync_id=${String(
        formData.get("integration_id") ?? ""
      )}`
    );
  }
}
