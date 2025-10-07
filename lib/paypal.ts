// lib/paypal.ts
const base =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  if (!id || !secret)
    throw new Error("Faltan PAYPAL_CLIENT_ID o PAYPAL_SECRET");

  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function getSubscription(subId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${base}/v1/billing/subscriptions/${subId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal subscription error: ${res.status} ${t}`);
  }
  return res.json();
}

export async function getOrder(orderID: string) {
  const token = await getAccessToken();
  const res = await fetch(`${base}/v2/checkout/orders/${orderID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal order error: ${res.status} ${t}`);
  }
  return res.json();
}
