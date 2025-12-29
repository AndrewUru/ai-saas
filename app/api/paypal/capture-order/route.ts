//C:\ai-saas\app\api\paypal\capture-order\route.ts

import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const paypalEnv = (process.env.PAYPAL_ENV ?? "").toLowerCase();
const PAYPAL_API =
  paypalEnv === "live" || paypalEnv === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

type PayPalOrderCapture = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
      }>;
    };
  }>;
};

type PayPalError = {
  name?: string;
  message?: string;
  details?: Array<{ issue?: string; description?: string }>;
};

function extractCaptureId(payload: PayPalOrderCapture): string | null {
  const id = payload.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

async function getAccessToken(): Promise<string> {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!client || !secret) {
    throw new Error("Faltan PAYPAL_CLIENT_ID o PAYPAL_SECRET");
  }

  const auth = Buffer.from(`${client}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${t}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal token missing");
  return data.access_token;
}

async function fetchOrder(
  orderID: string,
  token: string
): Promise<PayPalOrderCapture> {
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal order fetch error: ${res.status} ${t}`);
  }
  return (await res.json()) as PayPalOrderCapture;
}

async function captureOrder(
  orderID: string,
  token: string
): Promise<PayPalOrderCapture> {
  const res = await fetch(
    `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (res.ok) return (await res.json()) as PayPalOrderCapture;

  let errorJson: PayPalError | null = null;
  try {
    errorJson = (await res.json()) as PayPalError;
  } catch {
    // ignore JSON parse errors
  }

  const issue = errorJson?.details?.[0]?.issue;
  if (res.status === 422 && issue === "ORDER_ALREADY_CAPTURED") {
    return fetchOrder(orderID, token);
  }

  const message =
    errorJson?.message ||
    errorJson?.details?.[0]?.description ||
    "No se pudo capturar la orden";

  throw new Error(`PayPal capture error: ${res.status} ${message}`);
}

export async function POST(req: Request) {
  try {
    const bodyUnknown: unknown = await req.json().catch(() => null);

    const raw =
      (bodyUnknown as any)?.orderId ??
      (bodyUnknown as any)?.orderID ??
      "";

    const orderID = typeof raw === "string" ? raw.trim() : "";

    if (!orderID) {
      return NextResponse.json(
        { ok: false, error: "orderID requerido" },
        { status: 400 }
      );
    }

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const admin = createAdmin();

    const { data: existingSub, error: existingSubErr } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("paypal_order_id", orderID)
      .maybeSingle<{ user_id: string }>();

    if (existingSubErr) {
      console.error(existingSubErr);
      return NextResponse.json(
        { ok: false, error: "DB read falló" },
        { status: 500 }
      );
    }

    if (existingSub?.user_id && existingSub.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Orden no pertenece al usuario" },
        { status: 403 }
      );
    }

    const token = await getAccessToken();
    const capture = await captureOrder(orderID, token);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "Pago no completado" },
        { status: 400 }
      );
    }

    const captureId = extractCaptureId(capture);
    if (!captureId) {
      return NextResponse.json(
        { ok: false, error: "No se pudo obtener capture_id" },
        { status: 400 }
      );
    }

    if (existingSub) {
      const { error: subUpdateErr } = await admin
        .from("subscriptions")
        .update({
          status: "active",
          paypal_capture_id: captureId,
          user_id: user.id,
          plan: "pro",
          amount: 22,
          currency: "EUR",
        })
        .eq("paypal_order_id", orderID);

      if (subUpdateErr) {
        console.error(subUpdateErr);
        return NextResponse.json(
          { ok: false, error: "DB subscriptions falló" },
          { status: 500 }
        );
      }
    } else {
      const { error: subInsertErr } = await admin.from("subscriptions").insert({
        user_id: user.id,
        plan: "pro",
        paypal_order_id: orderID,
        status: "active",
        paypal_capture_id: captureId,
        amount: 22,
        currency: "EUR",
      });

      if (subInsertErr) {
        console.error(subInsertErr);
        return NextResponse.json(
          { ok: false, error: "DB subscriptions falló" },
          { status: 500 }
        );
      }
    }

    const { data: profRows, error: profUpdateErr } = await admin
      .from("profiles")
      .update({ is_paid: true, plan: "pro" })
      .eq("id", user.id)
      .select("id");

    if (profUpdateErr) {
      console.error(profUpdateErr);
      return NextResponse.json(
        { ok: false, error: "DB profiles falló" },
        { status: 500 }
      );
    }

    if (!profRows || profRows.length === 0) {
      const { error: profUpsertErr } = await admin
        .from("profiles")
        .upsert({ id: user.id, is_paid: true, plan: "pro" }, { onConflict: "id" });

      if (profUpsertErr) {
        console.error(profUpsertErr);
        return NextResponse.json(
          { ok: false, error: "DB profiles falló" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, status: "COMPLETED" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
