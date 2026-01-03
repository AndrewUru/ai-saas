import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createServer } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";
import { normalizeShopDomain, shopifyFetch } from "@/lib/shopify/client";
import { parseShopifyState, verifyShopifyHmac } from "@/lib/shopify/hmac";

export const runtime = "nodejs";

const STATE_COOKIE = "shopify_oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

function redirectWithError(
  requestUrl: string,
  error: string,
  status?: number,
  code?: string
) {
  const url = new URL("/integrations/shopify", requestUrl);
  url.searchParams.set("error", error);
  if (status) url.searchParams.set("status", String(status));
  if (code) url.searchParams.set("code", code);
  return NextResponse.redirect(url);
}

function redirectWithStatus(requestUrl: string, status: string) {
  const url = new URL("/integrations/shopify", requestUrl);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url);
}

function clearStateCookie(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shopParam = url.searchParams.get("shop") ?? "";
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  if (!apiKey || !apiSecret) {
    return clearStateCookie(redirectWithError(req.url, "unexpected"));
  }

  const shopDomain = normalizeShopDomain(shopParam);
  if (!shopDomain || !code || !stateParam) {
    return clearStateCookie(redirectWithError(req.url, "invalid"));
  }

  if (!verifyShopifyHmac(url.searchParams, apiSecret)) {
    return clearStateCookie(redirectWithError(req.url, "invalid"));
  }

  const cookieStore = await cookies();
  const signedState = cookieStore.get(STATE_COOKIE)?.value ?? "";
  const statePayload = parseShopifyState(signedState, apiSecret);

  if (!statePayload) {
    return clearStateCookie(redirectWithError(req.url, "invalid"));
  }

  if (
    statePayload.state !== stateParam ||
    statePayload.shop !== shopDomain ||
    Date.now() - statePayload.created_at > STATE_TTL_MS
  ) {
    return clearStateCookie(redirectWithError(req.url, "invalid"));
  }

  const userId = statePayload.user_id;
  if (!userId) {
    return clearStateCookie(redirectWithError(req.url, "invalid"));
  }

  const supabaseServer = await createServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (user && user.id !== userId) {
    return clearStateCookie(redirectWithError(req.url, "invalid"));
  }

  const tokenRes = await fetch(
    `https://${shopDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    }
  );

  if (!tokenRes.ok) {
    const body = await tokenRes.text().catch(() => "");
    let codeParam = "";
    try {
      const parsed = JSON.parse(body);
      codeParam =
        typeof parsed?.error === "string"
          ? parsed.error
          : typeof parsed?.errors === "string"
          ? parsed.errors
          : "";
    } catch {
      // ignore
    }

    return clearStateCookie(
      redirectWithError(req.url, "sync_failed", tokenRes.status, codeParam)
    );
  }

  const tokenPayload = await tokenRes.json().catch(() => ({}));
  const accessToken =
    typeof tokenPayload?.access_token === "string"
      ? tokenPayload.access_token
      : "";
  const scopes =
    typeof tokenPayload?.scope === "string" ? tokenPayload.scope : null;

  if (!accessToken) {
    return clearStateCookie(redirectWithError(req.url, "sync_failed", 401));
  }

  let currency: string | null = null;
  let shopName: string | null = null;

  try {
    const shopRes = await shopifyFetch(shopDomain, accessToken, "shop.json", {
      method: "GET",
    });
    const shopPayload = await shopRes.json().catch(() => ({}));
    currency =
      typeof shopPayload?.shop?.currency === "string"
        ? shopPayload.shop.currency
        : null;
    shopName =
      typeof shopPayload?.shop?.name === "string"
        ? shopPayload.shop.name
        : null;
  } catch {
    // ignore
  }

  const labelCandidate =
    statePayload.label?.trim() || shopName?.trim() || shopDomain;
  const label = labelCandidate || shopDomain;
  const isActive =
    typeof statePayload.is_active === "boolean" ? statePayload.is_active : true;
  const encryptedToken = encrypt(accessToken);
  const now = new Date().toISOString();

  const supabase = createAdmin();
  let status = "created";

  if (statePayload.integration_id) {
    const { data: existing } = await supabase
      .from("integrations_shopify")
      .select("id")
      .eq("id", statePayload.integration_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("integrations_shopify")
        .update({
          label,
          shop_domain: shopDomain,
          is_active: isActive,
          access_token_enc: encryptedToken,
          scopes,
          currency,
          updated_at: now,
        })
        .eq("id", existing.id)
        .eq("user_id", userId);

      if (error) {
        return clearStateCookie(redirectWithError(req.url, "db"));
      }

      status = "updated";
    }
  }

  if (status === "created") {
    const { data: existingByShop } = await supabase
      .from("integrations_shopify")
      .select("id")
      .eq("user_id", userId)
      .eq("shop_domain", shopDomain)
      .maybeSingle();

    if (existingByShop?.id) {
      const { error } = await supabase
        .from("integrations_shopify")
        .update({
          label,
          is_active: isActive,
          access_token_enc: encryptedToken,
          scopes,
          currency,
          updated_at: now,
        })
        .eq("id", existingByShop.id)
        .eq("user_id", userId);

      if (error) {
        return clearStateCookie(redirectWithError(req.url, "db"));
      }

      status = "updated";
    } else {
      const { data: positionData } = await supabase
        .from("integrations_shopify")
        .select("position")
        .eq("user_id", userId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition =
        positionData && positionData.length > 0
          ? (positionData[0].position ?? 0) + 1
          : 0;

      const { error } = await supabase.from("integrations_shopify").insert({
        user_id: userId,
        label,
        shop_domain: shopDomain,
        is_active: isActive,
        position: nextPosition,
        access_token_enc: encryptedToken,
        scopes,
        currency,
        webhook_token: randomUUID(),
      });

      if (error) {
        return clearStateCookie(redirectWithError(req.url, "db"));
      }

      status = "created";
    }
  }

  return clearStateCookie(redirectWithStatus(req.url, status));
}
