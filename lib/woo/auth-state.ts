import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

// Long enough for the merchant to log into WordPress before approving.
const STATE_TTL_MS = 30 * 60 * 1000;

export type WooAuthState = {
  userId: string;
  storeUrl: string;
  label: string;
  expiresAt: number;
};

function getStateKey() {
  const secret = process.env.CRED_ENC_KEY;
  if (!secret) throw new Error("Missing CRED_ENC_KEY env var.");
  return createHmac("sha256", secret).update("woo-auth-state").digest();
}

function sign(payload: string) {
  return createHmac("sha256", getStateKey()).update(payload).digest("base64url");
}

/**
 * WooCommerce devuelve tal cual el parámetro `user_id` en el callback con las
 * claves. Lo usamos como estado firmado para saber de qué usuario y tienda son.
 */
export function signWooAuthState(input: Omit<WooAuthState, "expiresAt">) {
  const state: WooAuthState = { ...input, expiresAt: Date.now() + STATE_TTL_MS };
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyWooAuthState(token: string): WooAuthState | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as WooAuthState;
    if (typeof state.expiresAt !== "number" || state.expiresAt < Date.now()) return null;
    if (typeof state.userId !== "string" || typeof state.storeUrl !== "string") return null;
    return state;
  } catch {
    return null;
  }
}
