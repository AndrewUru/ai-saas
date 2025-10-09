import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_MODEL = process.env.OPENAI_AGENT_MODEL ?? "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
  "Eres un agente de soporte para tiendas online. Responde de forma clara y util, siguiendo las politicas de la marca.";

const LANGUAGE_HINTS: Record<string, string> = {
  es: "Responde siempre en espanol neutral para ecommerce. Manten un tono profesional cercano.",
  en: "Always respond in English with a helpful, concise ecommerce tone.",
  pt: "Responda em portugues do Brasil com foco em suporte de ecommerce.",
  fr: "Reponds en francais en gardant un ton professionnel et amical.",
};

function buildSystemPrompt(agent: {
  prompt_system: string | null;
  description: string | null;
  language: string | null;
}) {
  const sections = [
    agent.prompt_system?.trim(),
    agent.description?.trim(),
    DEFAULT_SYSTEM_PROMPT,
  ].filter(Boolean) as string[];

  const basePrompt = sections.length ? sections[0] : DEFAULT_SYSTEM_PROMPT;
  const extras = sections.slice(1);

  const languageInstruction = agent.language
    ? LANGUAGE_HINTS[agent.language] ??
      `Responde siempre en ${agent.language} salvo que el cliente solicite lo contrario.`
    : null;

  return [basePrompt, ...extras, languageInstruction].filter(Boolean).join("\n\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = String(body.api_key || "").trim();
    const message = String(body.message || "").trim();

    if (!apiKey || !message) {
      return NextResponse.json(
        { error: "Faltan parametros (api_key o message)" },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "El mensaje es demasiado largo." },
        { status: 413 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error("[AI SaaS] Falta OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Configuracion incompleta del modelo." },
        { status: 500 }
      );
    }

    const supabase = createAdmin();

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select(
        "id, user_id, is_active, messages_limit, description, prompt_system, language, fallback_url"
      )
      .eq("api_key", apiKey)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agente no encontrado o API key invalida." },
        { status: 404 }
      );
    }

    if (!agent.is_active) {
      return NextResponse.json(
        { error: "El agente esta inactivo.", fallback_url: agent.fallback_url ?? null },
        { status: 403 }
      );
    }

    if (agent.messages_limit && agent.messages_limit <= 0) {
      return NextResponse.json(
        {
          error: "Se alcanzo el limite de mensajes para este agente.",
          fallback_url: agent.fallback_url ?? null,
        },
        { status: 403 }
      );
    }

    const { data: recentMessages } = await supabase
      .from("agent_messages")
      .select("message, reply")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(6);

    const history = (recentMessages ?? []).flatMap((entry) => {
      const pairs = [];
      if (entry.message) {
        pairs.push({ role: "user" as const, content: entry.message });
      }
      if (entry.reply) {
        pairs.push({ role: "assistant" as const, content: entry.reply });
      }
      return pairs;
    });

    const payload = {
      model: DEFAULT_MODEL,
      temperature: 0.4,
      messages: [
        { role: "system" as const, content: buildSystemPrompt(agent) },
        ...history.reverse(),
        { role: "user" as const, content: message },
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[AI SaaS] OpenAI error:", response.status, errorBody);
      return NextResponse.json(
        {
          error: "El modelo no pudo generar una respuesta.",
          fallback_url: agent.fallback_url ?? null,
        },
        { status: 502 }
      );
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Lo siento, no pude generar una respuesta.";

    await supabase.from("agent_messages").insert({
      agent_id: agent.id,
      message,
      reply,
      created_at: new Date().toISOString(),
    });

    if (agent.messages_limit && agent.messages_limit > 0) {
      await supabase
        .from("agents")
        .update({ messages_limit: agent.messages_limit - 1 })
        .eq("id", agent.id);
    }

    return NextResponse.json(
      { reply, fallback_url: agent.fallback_url ?? null },
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

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
