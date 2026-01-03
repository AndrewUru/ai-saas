import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServer } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { normalizeShopDomain } from "@/lib/shopify/client";
import {
  signShopifyState,
  type ShopifyOAuthState,
} from "@/lib/shopify/hmac";

export const runtime = "nodejs";

const STATE_COOKIE = "shopify_oauth_state";
const STATE_TTL_SECONDS = 10 * 60;

function parseIsActive(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export async function GET(req: Request) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = new URL(req.url);
  const shopParam = url.searchParams.get("shop") ?? "";
  const labelParam = url.searchParams.get("label");
  const integrationId = url.searchParams.get("integration_id");
  const isActive = parseIsActive(url.searchParams.get("is_active"));

  const shopDomain = normalizeShopDomain(shopParam);
  if (!shopDomain) {
    return NextResponse.redirect(
      new URL("/integrations/shopify?error=invalid", req.url)
    );
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.redirect(
      new URL("/integrations/shopify?error=unexpected", req.url)
    );
  }

  const scopes = process.env.SHOPIFY_SCOPES ?? "read_products,read_inventory";
  const state = randomUUID();

  const payload: ShopifyOAuthState = {
    state,
    shop: shopDomain,
    user_id: user.id,
    label: labelParam?.trim() || null,
    is_active: isActive,
    integration_id: integrationId ?? null,
    created_at: Date.now(),
  };

  const signedState = signShopifyState(payload, apiSecret);

  const redirectUri = `${getSiteUrl()}/api/integrations/shopify/auth/callback`;
  const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
  authUrl.searchParams.set("client_id", apiKey);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(STATE_COOKIE, signedState, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });

  return response;
}
