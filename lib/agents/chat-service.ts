import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_MESSAGE_LENGTH = 2000;
export const FALLBACK_AGENT_MODEL = "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
  "Eres un agente de soporte para tiendas online. Responde de forma clara y util, siguiendo las politicas de la marca.";

const LANGUAGE_HINTS: Record<string, string> = {
  es: "Responde siempre en espanol neutral para ecommerce. Manten un tono profesional cercano.",
  en: "Always respond in English with a helpful, concise ecommerce tone.",
  pt: "Responda em portugues do Brasil com foco em suporte de ecommerce.",
  fr: "Reponds en francais en gardant un ton professionnel et amical.",
};

type AgentRecord = {
  id: string;
  user_id: string;
  is_active: boolean;
  messages_limit: number | null;
  description: string | null;
  prompt_system: string | null;
  language: string | null;
  fallback_url: string | null;
};

type AgentMessageRecord = {
  message: string | null;
  reply: string | null;
};

type ChatHistoryItem =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "system"; content: string };

export type AgentChatDeps = {
  supabase: SupabaseClient;
  openaiApiKey: string;
  model?: string;
  fetcher?: typeof fetch;
  now?: () => string;
  logger?: Pick<typeof console, "error">;
};

export type AgentChatResult =
  | { ok: true; reply: string; fallbackUrl: string | null }
  | { ok: false; status: number; error: string; fallbackUrl?: string | null };

function buildSystemPrompt(agent: AgentRecord) {
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

function buildHistory(recentMessages: AgentMessageRecord[] | null | undefined): ChatHistoryItem[] {
  return (recentMessages ?? []).flatMap((entry) => {
    const pairs: ChatHistoryItem[] = [];
    if (entry.message) {
      pairs.push({ role: "user", content: entry.message });
    }
    if (entry.reply) {
      pairs.push({ role: "assistant", content: entry.reply });
    }
    return pairs;
  });
}

export async function chatWithAgent(
  params: { apiKey: string; message: string },
  deps: AgentChatDeps
): Promise<AgentChatResult> {
  const logger = deps.logger ?? console;
  const { apiKey, message } = params;

  if (!apiKey || !message) {
    return {
      ok: false,
      status: 400,
      error: "Faltan parametros (api_key o message)",
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      status: 413,
      error: "El mensaje es demasiado largo.",
    };
  }

  if (!deps.openaiApiKey) {
    logger.error("[AI SaaS] Falta OPENAI_API_KEY");
    return {
      ok: false,
      status: 500,
      error: "Configuracion incompleta del modelo.",
    };
  }

  const { data: agent, error: agentError } = await deps.supabase
    .from("agents")
    .select(
      "id, user_id, is_active, messages_limit, description, prompt_system, language, fallback_url"
    )
    .eq("api_key", apiKey)
    .single();

  if (agentError || !agent) {
    return {
      ok: false,
      status: 404,
      error: "Agente no encontrado o API key invalida.",
    };
  }

  if (!agent.is_active) {
    return {
      ok: false,
      status: 403,
      error: "El agente esta inactivo.",
      fallbackUrl: agent.fallback_url ?? null,
    };
  }

  if (agent.messages_limit && agent.messages_limit <= 0) {
    return {
      ok: false,
      status: 403,
      error: "Se alcanzo el limite de mensajes para este agente.",
      fallbackUrl: agent.fallback_url ?? null,
    };
  }

  const { data: recentMessages } = await deps.supabase
    .from("agent_messages")
    .select("message, reply")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const history = buildHistory(recentMessages).reverse();

  const payload = {
    model: deps.model ?? FALLBACK_AGENT_MODEL,
    temperature: 0.4,
    messages: [
      { role: "system" as const, content: buildSystemPrompt(agent) },
      ...history,
      { role: "user" as const, content: message },
    ],
  };

  const response = await (deps.fetcher ?? fetch)("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${deps.openaiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    logger.error("[AI SaaS] OpenAI error:", response.status, errorBody);
    return {
      ok: false,
      status: 502,
      error: "El modelo no pudo generar una respuesta.",
      fallbackUrl: agent.fallback_url ?? null,
    };
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Lo siento, no pude generar una respuesta.";

  await deps.supabase.from("agent_messages").insert({
    agent_id: agent.id,
    message,
    reply,
    created_at: deps.now ? deps.now() : new Date().toISOString(),
  });

  if (agent.messages_limit && agent.messages_limit > 0) {
    await deps.supabase
      .from("agents")
      .update({ messages_limit: agent.messages_limit - 1 })
      .eq("id", agent.id);
  }

  return {
    ok: true,
    reply,
    fallbackUrl: agent.fallback_url ?? null,
  };
}
