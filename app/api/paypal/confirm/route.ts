import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

const PAYPAL_API =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

type OrderResponse = {
  id: string;
  status: string; // "COMPLETED"
  purchase_units?: { amount?: { value?: string; currency_code?: string } }[];
};

async function getAccessToken(): Promise<string> {
  const client = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  const auth = Buffer.from(`${client}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("No se pudo obtener token de PayPal");
  const data = await res.json();
  return data.access_token as string;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function POST(req: Request) {
  try {
    const { orderID, plan, expectedAmount, expectedCurrency } =
      await req.json();

    if (!orderID) {
      return NextResponse.json(
        { ok: false, error: "orderID requerido" },
        { status: 400 }
      );
    }

    // Sesión
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

    // Verificar orden en PayPal
    const token = await getAccessToken();
    const orderRes = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!orderRes.ok) {
      return NextResponse.json(
        { ok: false, error: "No se pudo verificar la orden" },
        { status: 400 }
      );
    }
    const order = (await orderRes.json()) as OrderResponse;

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "Pago no completado" },
        { status: 400 }
      );
    }

    // Validar importe/currency (defensa básica contra manipulación)
    const pu = order.purchase_units?.[0];
    const amount = pu?.amount?.value;
    const currency = pu?.amount?.currency_code;
    if (
      (expectedAmount && amount !== expectedAmount) ||
      (expectedCurrency && currency !== expectedCurrency)
    ) {
      return NextResponse.json(
        { ok: false, error: "Importe o divisa no válidos" },
        { status: 400 }
      );
    }

    // Leer profile actual
    const { data: currentProfile, error: readErr } = await supabase
      .from("profiles")
      .select("plan, active_until")
      .eq("id", user.id)
      .single();

    if (readErr && readErr.code !== "PGRST116") {
      // PGRST116 -> row not found
      console.error(readErr);
    }

    const now = new Date();
    const currentActive = currentProfile?.active_until
      ? new Date(currentProfile.active_until)
      : null;
    const base = currentActive && currentActive > now ? currentActive : now;
    const newActive = addDays(base, 30);

    // Upsert plan y fecha nueva
    const { error: upsertErr } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        plan: plan || "basic",
        active_until: newActive.toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertErr) {
      console.error(upsertErr);
      return NextResponse.json(
        { ok: false, error: "DB upsert falló" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      active_until: newActive.toISOString(),
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
