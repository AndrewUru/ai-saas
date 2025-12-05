import type { SupabaseClient } from "@supabase/supabase-js";
import {
  agentRecordSchema,
  chatRequestSchema,
  type AgentRecord,
} from "@/lib/contracts/agent";

export const FALLBACK_AGENT_MODEL = "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
  "You are a support agent for online stores. Answer clearly and helpfully, following the brand's policies.";

const LANGUAGE_HINTS: Record<string, string> = {
  es: "Responde siempre en español neutro para ecommerce. Mantén un tono profesional y cercano.",
  en: "Always respond in English with a helpful, concise ecommerce tone.",
  pt: "Responda em português do Brasil com foco em suporte de ecommerce.",
  fr: "Réponds en français en gardant un ton professionnel et amical.",
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
      `Always respond in ${agent.language} unless the customer explicitly asks otherwise.`
    : null;

  return [basePrompt, ...extras, languageInstruction]
    .filter(Boolean)
    .join("\n\n");
}

function buildHistory(
  recentMessages: AgentMessageRecord[] | null | undefined
): ChatHistoryItem[] {
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

  const parsedRequest = chatRequestSchema.safeParse({
    api_key: params.apiKey,
    message: params.message,
  });

  if (!parsedRequest.success) {
    const firstIssue = parsedRequest.error.issues[0];
    return {
      ok: false,
      status: firstIssue.code === "too_big" ? 413 : 400,
      error: firstIssue.message,
    };
  }

  const { api_key: apiKey, message } = parsedRequest.data;

  if (!deps.openaiApiKey) {
    logger.error("[AI SaaS] Missing OPENAI_API_KEY");
    return {
      ok: false,
      status: 500,
      error: "Model configuration is incomplete.",
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
      error: "Agent not found or invalid API key.",
    };
  }

  const agentParse = agentRecordSchema.safeParse(agent);
  if (!agentParse.success) {
    logger.error(
      "[AI SaaS] Agent parse error:",
      agentParse.error.flatten().fieldErrors
    );
    return {
      ok: false,
      status: 500,
      error: "Internal server error.",
    };
  }

  const validAgent: AgentRecord = agentParse.data;

  if (!validAgent.is_active) {
    return {
      ok: false,
      status: 403,
      error: "This agent is inactive.",
      fallbackUrl: validAgent.fallback_url ?? null,
    };
  }

  if (validAgent.messages_limit && validAgent.messages_limit <= 0) {
    return {
      ok: false,
      status: 403,
      error: "The message limit for this agent has been reached.",
      fallbackUrl: validAgent.fallback_url ?? null,
    };
  }

  const { data: recentMessages } = await deps.supabase
    .from("agent_messages")
    .select("message, reply")
    .eq("agent_id", validAgent.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const history = buildHistory(recentMessages).reverse();

  const payload = {
    model: deps.model ?? FALLBACK_AGENT_MODEL,
    temperature: 0.4,
    messages: [
      { role: "system" as const, content: buildSystemPrompt(validAgent) },
      ...history,
      { role: "user" as const, content: message },
    ],
  };

  const response = await (deps.fetcher ?? fetch)(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deps.openaiApiKey}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    logger.error("[AI SaaS] OpenAI error:", response.status, errorBody);
    return {
      ok: false,
      status: 502,
      error: "The model could not generate a response.",
      fallbackUrl: validAgent.fallback_url ?? null,
    };
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Sorry, I couldn't generate a response.";

  await deps.supabase.from("agent_messages").insert({
    agent_id: validAgent.id,
    message,
    reply,
    created_at: deps.now ? deps.now() : new Date().toISOString(),
  });

  if (validAgent.messages_limit && validAgent.messages_limit > 0) {
    await deps.supabase
      .from("agents")
      .update({ messages_limit: validAgent.messages_limit - 1 })
      .eq("id", validAgent.id);
  }

  return {
    ok: true,
    reply,
    fallbackUrl: validAgent.fallback_url ?? null,
  };
}
