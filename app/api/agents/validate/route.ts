import { NextResponse } from "next/server";
import { hasActivePlan } from "@/lib/plans";
import { createServer } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export async function POST(req: Request) {
  const e = getMessages(getRequestLocale(req)).api;
  const supabase = await createServer();
  const { api_key } = await req.json();
  if (!api_key) {
    return NextResponse.json(
      { ok: false, error: e.missingApiKey },
      { status: 400 }
    );
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id,user_id,is_active")
    .eq("api_key", api_key)
    .single();
  if (!agent || !agent.is_active) {
    return NextResponse.json(
      { ok: false, error: e.agentInactive },
      { status: 403 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan,active_until,is_paid")
    .eq("id", agent.user_id)
    .single();
  if (!hasActivePlan(profile)) {
    return NextResponse.json(
      { ok: false, error: e.subscriptionInactive },
      { status: 402 }
    );
  }

  return NextResponse.json({ ok: true, agent_id: agent.id });
}
