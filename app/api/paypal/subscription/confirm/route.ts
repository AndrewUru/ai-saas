import { NextResponse } from "next/server";
import { getDefaultMessageLimit } from "@/lib/plans";
import { getSubscription } from "@/lib/paypal";
import { createAdmin } from "@/lib/supabase/admin";
import { createServer } from "@/lib/supabase/server";
import { format } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

const PRO_PAYPAL_PLAN_IDS = new Set(
  [process.env.PAYPAL_PLAN_PRO].filter(Boolean)
);

export async function POST(req: Request) {
  const e = getMessages(getRequestLocale(req)).api;
  try {
    const { subscriptionID, plan: requestedPlan } = (await req.json()) as {
      subscriptionID: string;
      plan?: string;
    };
    if (!subscriptionID) {
      return NextResponse.json(
        { ok: false, error: e.paypal.subscriptionIdRequired },
        { status: 400 }
      );
    }

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: e.notAuthenticated },
        { status: 401 }
      );
    }

    const sub = await getSubscription(subscriptionID);
    const status = sub.status;
    const paypalPlanId = sub.plan_id as string;
    const nextBillingTime = sub.billing_info?.next_billing_time;

    if (!PRO_PAYPAL_PLAN_IDS.has(paypalPlanId)) {
      return NextResponse.json(
        { ok: false, error: e.paypal.unknownPlan },
        { status: 400 }
      );
    }
    if (requestedPlan && requestedPlan !== "pro") {
      return NextResponse.json(
        {
          ok: false,
          error: format(e.paypal.planMismatch, { plan: requestedPlan }),
        },
        { status: 400 }
      );
    }

    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "pro",
          paypal_subscription_id: subscriptionID,
          paypal_plan_id: paypalPlanId,
          status: status?.toLowerCase(),
          next_billing_time: nextBillingTime
            ? new Date(nextBillingTime).toISOString()
            : null,
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

    if (subscriptionError) {
      return NextResponse.json(
        { ok: false, error: `DB subscriptions: ${subscriptionError.message}` },
        { status: 500 }
      );
    }

    if (status === "ACTIVE") {
      const { error: profileError } = await supabase.rpc("activate_user_plan", {
        p_user_id: user.id,
        p_plan: "pro",
        p_months: 1,
      });
      if (profileError) {
        return NextResponse.json(
          { ok: false, error: `DB profiles: ${profileError.message}` },
          { status: 500 }
        );
      }

      const proMessageLimit = getDefaultMessageLimit("pro");
      const { error: agentLimitError } = await createAdmin()
        .from("agents")
        .update({ messages_limit: proMessageLimit })
        .eq("user_id", user.id)
        .lt("messages_limit", proMessageLimit);
      if (agentLimitError) {
        return NextResponse.json(
          { ok: false, error: `DB agents: ${agentLimitError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : e.unknown;
    console.error(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
