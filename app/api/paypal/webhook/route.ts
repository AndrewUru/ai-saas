// app/api/paypal/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/paypal-verify"; // tu helper de verificación real
import { z } from "zod";

// ---- Tipos/validación del payload de PayPal (mínimos y extensibles)
const BillingInfo = z
  .object({
    next_billing_time: z.string().datetime().optional(),
  })
  .partial();

const PayPalResource = z
  .object({
    id: z.string().optional(), // subscriptionID: "I-XXXX"
    status: z.string().optional(), // ACTIVE|SUSPENDED|CANCELLED
    plan_id: z.string().optional(), // "P-XXXX"
    billing_info: BillingInfo.optional(),
  })
  .partial();

const PayPalWebhookSchema = z.object({
  id: z.string().optional(),
  event_type: z.string(),
  resource: PayPalResource.optional(),
});

// ---- Cliente Supabase (service role)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // 1) Verificar firma (prod)
    const ok = await verifyWebhookSignature(rawBody, req.headers);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Firma inválida" },
        { status: 400 }
      );
    }

    // 2) Parse + validar
    const jsonUnknown: unknown = JSON.parse(rawBody);
    const parsed = PayPalWebhookSchema.safeParse(jsonUnknown);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Payload inválido" },
        { status: 400 }
      );
    }
    const evt = parsed.data; // tipado seguro

    // 3) Manejo de eventos
    const event = evt.event_type;
    const subId = evt.resource?.id ?? null;
    const status = evt.resource?.status?.toLowerCase();

    if (
      event === "BILLING.SUBSCRIPTION.ACTIVATED" ||
      event === "BILLING.SUBSCRIPTION.SUSPENDED" ||
      event === "BILLING.SUBSCRIPTION.CANCELLED"
    ) {
      if (subId && status) {
        await supabase
          .from("subscriptions")
          .update({ status })
          .eq("paypal_subscription_id", subId);
      }
    }

    if (event === "PAYMENT.SALE.COMPLETED") {
      // Aquí puedes registrar cobros o refrescar datos si quieres
      // const amount = evt.resource?.amount?.value;
      // const currency = evt.resource?.amount?.currency_code;
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("Webhook error:", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
