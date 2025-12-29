import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

const PAYPAL_API =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PRO_PRICE_EUR = "22.00";
const CURRENCY = "EUR";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error("PayPal credentials missing");
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok || !data?.access_token) {
    throw new Error(data?.error_description || "Failed to get PayPal token");
  }

  return data.access_token as string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // (Opcional) lee plan del body, pero NO uses amount del body
    const body = await req.json().catch(() => ({}));
    const plan = body?.plan === "pro" ? "pro" : "pro";

    const accessToken = await getPayPalAccessToken();

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "AI SaaS PRO (one-time)",
            amount: {
              currency_code: CURRENCY,
              value: PRO_PRICE_EUR,
            },
          },
        ],
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok || !order?.id) {
      return NextResponse.json(
        { error: order?.message || "Could not create order" },
        { status: 400 }
      );
    }

    // Guarda pending (tu tabla ya existe)
    const { error: insErr } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan,
      paypal_order_id: order.id,
      status: "pending",
      amount: Number(PRO_PRICE_EUR),
      currency: CURRENCY,
    });

    if (insErr) {
      // Si falla DB, igual devuelve orderId (puedes loguear)
      console.error("Supabase insert error:", insErr);
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
