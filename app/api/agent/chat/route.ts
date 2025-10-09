import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Configuración opcional: límite de tokens o de mensajes simultáneos
const MAX_MESSAGE_LENGTH = 2000;

// ---------------------------------------------------------------------------
// Función principal del endpoint
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = String(body.api_key || "").trim();
    const message = String(body.message || "").trim();

    if (!apiKey || !message) {
      return NextResponse.json(
        { error: "Faltan parámetros (api_key o message)" },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "El mensaje es demasiado largo." },
        { status: 413 }
      );
    }

    const supabase = createAdmin();

    // -----------------------------------------------------------------------
    // Buscar agente por API Key
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, user_id, is_active, messages_limit")
      .eq("api_key", apiKey)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agente no encontrado o API key inválida." },
        { status: 404 }
      );
    }

    if (!agent.is_active) {
      return NextResponse.json(
        { error: "El agente está inactivo." },
        { status: 403 }
      );
    }

    // -----------------------------------------------------------------------
    // Verificar límite de mensajes (si aplica)
    if (agent.messages_limit && agent.messages_limit <= 0) {
      return NextResponse.json(
        { error: "Se alcanzó el límite de mensajes para este agente." },
        { status: 403 }
      );
    }

    // -----------------------------------------------------------------------
    // ⚙️ Aquí puedes conectar tu modelo de IA real (OpenAI, GPT, etc.)
    // Ejemplo con OpenAI SDK:
    //
    // import OpenAI from "openai";
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: message }],
    // });
    // const reply = completion.choices[0]?.message?.content || "Sin respuesta";

    // Por ahora usamos una respuesta simulada:
    const reply = `Echo: ${message}`;

    // -----------------------------------------------------------------------
    // Registrar mensaje (opcional) en tabla `agent_messages`
    await supabase.from("agent_messages").insert({
      agent_id: agent.id,
      message,
      reply,
      created_at: new Date().toISOString(),
    });

    // Si hay límite de mensajes, reducirlo:
    if (agent.messages_limit && agent.messages_limit > 0) {
      await supabase
        .from("agents")
        .update({ messages_limit: agent.messages_limit - 1 })
        .eq("id", agent.id);
    }

    // -----------------------------------------------------------------------
    return NextResponse.json(
      { reply },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (err) {
    console.error("[AI SaaS] Error en /api/agent/chat:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Preflight para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
