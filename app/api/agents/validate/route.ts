import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServer();
  const { api_key } = await req.json();
  if (!api_key)
    return NextResponse.json(
      { ok: false, error: "Falta api_key" },
      { status: 400 }
    );

  const { data: agent } = await supabase
    .from("agents")
    .select("id,user_id,is_active")
    .eq("api_key", api_key)
    .single();
  if (!agent || !agent.is_active)
    return NextResponse.json(
      { ok: false, error: "Agente inactivo" },
      { status: 403 }
    );

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan,active_until")
    .eq("id", agent.user_id)
    .single();
  const active =
    profile?.active_until && new Date(profile.active_until) > new Date();
  if (!active)
    return NextResponse.json(
      { ok: false, error: "Suscripción inactiva" },
      { status: 402 }
    );

  return NextResponse.json({ ok: true, agent_id: agent.id });
}
