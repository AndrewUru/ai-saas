// app/api/paypal/subscription/confirm/route.ts
import { NextResponse } from "next/server";
import { getSubscription } from "@/lib/paypal";
import { createServer } from "@/lib/supabase/server";

const PLAN_MAP: Record<string, { plan: "basic" | "pro"; months: number }> = {
  // Mapea tus plan_id de PayPal -> plan interno + meses por ciclo
  [process.env.PAYPAL_PLAN_BASIC as string]: { plan: "basic", months: 1 },
  // "P-XXXX_PRO": { plan: "pro", months: 1 }
};

export async function POST(req: Request) {
  try {
    const { subscriptionID, plan } = (await req.json()) as {
      subscriptionID: string;
      plan: string;
    };
    if (!subscriptionID) {
      return NextResponse.json(
        { ok: false, error: "subscriptionID requerido" },
        { status: 400 }
      );
    }

    // 1) Autenticación
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { ok: false, error: "No autenticado" },
        { status: 401 }
      );

    // 2) Consultar la suscripción en PayPal
    const sub = await getSubscription(subscriptionID);
    const status = sub.status; // APPROVAL_PENDING | ACTIVE | SUSPENDED | CANCELLED
    const paypalPlanId = sub.plan_id as string;
    const nbTime = sub.billing_info?.next_billing_time; // string ISO

    // 3) Validar que el plan existe en nuestro mapeo
    const mapped = PLAN_MAP[paypalPlanId];
    if (!mapped) {
      return NextResponse.json(
        { ok: false, error: "Plan PayPal no reconocido" },
        { status: 400 }
      );
    }

    // 4) Guardar/actualizar suscripción
    const { error: upErr } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan: mapped.plan,
        paypal_subscription_id: subscriptionID,
        paypal_plan_id: paypalPlanId,
        status: status?.toLowerCase(), // p.ej. "active"
        next_billing_time: nbTime ? new Date(nbTime).toISOString() : null,
        status_reason: sub.status_update_time
          ? `updated_at=${sub.status_update_time}`
          : null,
        started_at: sub.start_time
          ? new Date(sub.start_time).toISOString()
          : new Date().toISOString(),
        renewed_until: null,
      },
      { onConflict: "paypal_subscription_id" }
    );

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: `DB subscriptions: ${upErr.message}` },
        { status: 500 }
      );
    }

    // 5) Activar plan si la suscripción está activa
    if (status === "ACTIVE") {
      const { error: profErr } = await supabase.rpc("activate_user_plan", {
        p_user_id: user.id,
        p_plan: mapped.plan,
        p_months: mapped.months,
      });
      if (profErr) {
        return NextResponse.json(
          { ok: false, error: `DB profiles: ${profErr.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, status });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
