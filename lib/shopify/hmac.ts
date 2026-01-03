import { createHmac, timingSafeEqual } from "crypto";

export type ShopifyOAuthState = {
  state: string;
  shop: string;
  user_id: string;
  label: string | null;
  is_active: boolean | null;
  integration_id: string | null;
  created_at: number;
};

const STATE_SEPARATOR = ".";

export function signShopifyState(payload: ShopifyOAuthState, secret: string) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = createHmac("sha256", secret)
    .update(encoded)
    .digest("hex");
  return `${encoded}${STATE_SEPARATOR}${signature}`;
}

export function parseShopifyState(
  value: string,
  secret: string
): ShopifyOAuthState | null {
  if (!value) return null;
  const [encoded, signature] = value.split(STATE_SEPARATOR);
  if (!encoded || !signature) return null;

  const expected = createHmac("sha256", secret)
    .update(encoded)
    .digest("hex");

  try {
    if (
      !timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(signature, "hex")
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;

  const payload = parsed as Partial<ShopifyOAuthState>;
  if (typeof payload.state !== "string") return null;
  if (typeof payload.shop !== "string") return null;
  if (typeof payload.user_id !== "string") return null;
  if (typeof payload.created_at !== "number") return null;

  return {
    state: payload.state,
    shop: payload.shop,
    user_id: payload.user_id,
    label: typeof payload.label === "string" ? payload.label : null,
    is_active:
      typeof payload.is_active === "boolean" ? payload.is_active : null,
    integration_id:
      typeof payload.integration_id === "string"
        ? payload.integration_id
        : null,
    created_at: payload.created_at,
  };
}

export function verifyShopifyHmac(params: URLSearchParams, secret: string) {
  const provided = params.get("hmac");
  if (!provided) return false;

  const entries: Array<[string, string]> = [];
  params.forEach((value, key) => {
    if (key === "hmac" || key === "signature") return;
    entries.push([key, value]);
  });

  entries.sort(([a], [b]) => a.localeCompare(b));
  const message = entries.map(([key, value]) => `${key}=${value}`).join("&");

  const digest = createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(provided, "hex")
    );
  } catch {
    return false;
  }
}
