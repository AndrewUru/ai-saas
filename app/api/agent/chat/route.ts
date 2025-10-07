import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
// import { runAgent } from "@/lib/agent"; // TU implementación LangChain

export async function POST(req: Request) {
  const supabase = await createServer();
  const { api_key, message } = await req.json();

  if (!api_key || !message)
    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 }
    );

  const { data: agent } = await supabase
    .from("agents")
    .select("id,user_id,is_active,messages_limit")
    .eq("api_key", api_key)
    .single();
  if (!agent || !agent.is_active)
    return NextResponse.json({ error: "Agente inactivo" }, { status: 403 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan,active_until")
    .eq("id", agent.user_id)
    .single();
  const active =
    profile?.active_until && new Date(profile.active_until) > new Date();
  if (!active)
    return NextResponse.json(
      { error: "Suscripción inactiva" },
      { status: 402 }
    );

  // Consumo/limite
  const { count } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agent.id);
  if (agent.messages_limit && count && count >= agent.messages_limit) {
    return NextResponse.json(
      { error: "Límite de mensajes alcanzado" },
      { status: 429 }
    );
  }

  // Respuesta del agente (placeholder)
  // const reply = await runAgent({ message, agentId: agent.id });
  const reply = `Echo: ${message}`; // ⚠️ Sustituir por tu LangChain

  // Log de uso
  await supabase.from("usage_logs").insert({
    agent_id: agent.id,
    user_message: message,
    ai_response: reply,
    tokens_used: null,
  });

  return NextResponse.json({ reply });
}
