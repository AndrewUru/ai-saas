import type { SupabaseClient } from "@supabase/supabase-js";
import {
  agentRecordSchema,
  chatRequestSchema,
  type AgentRecord,
} from "@/lib/contracts/agent";
import { wooSearchProductsByApiKey } from "@/lib/tools/woo";

export const FALLBACK_AGENT_MODEL = "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
  "You are a support agent. Answer clearly and helpfully, following the brand's policies.";

const LANGUAGE_HINTS: Record<string, string> = {
  es: "Responde siempre en español neutro. Mantén un tono profesional y cercano.",
  en: "Always respond in English with a helpful, concise tone.",
  pt: "Responda em português do Brasil com foco em suporte.",
  fr: "Réponds en français en gardant un ton professionnel et amical.",
};

type AgentMessageRecord = {
  message: string | null;
  reply: string | null;
};

type ProductSearchItem = {
  woo_product_id: number;
  name: string;
  price: string | null;
  stock_status: string | null;
  permalink: string | null;
  image: string | null;
  score: number | null;
};

// Simplified types for OpenAI structures
type OpenAIToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

// Simplified chat history type for internal use
type ChatHistoryItem =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; tool_calls?: OpenAIToolCall[] }
  | { role: "system"; content: string }
  | { role: "tool"; tool_call_id: string; content: string };

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

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the store catalog by name or keyword. Returns a compact list of products; use require_freshness only when you must confirm stock or pricing right now.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The product name or keyword to search for.",
          },
          require_freshness: {
            type: "boolean",
            description:
              "Set true only if the user explicitly asks to confirm live stock or pricing.",
          },
          product_id: {
            type: "number",
            description:
              "WooCommerce product ID to refresh live if available.",
          },
        },
        required: ["query"],
      },
    },
  },
];

function buildProductListTitle(language: string | null, query: string | null) {
  const trimmedQuery = query?.trim();
  const baseTitles: Record<string, string> = {
    es: "Productos sugeridos",
    en: "Suggested products",
    pt: "Produtos sugeridos",
    fr: "Produits suggeres",
  };

  if (!trimmedQuery) {
    return baseTitles[language ?? ""] ?? "Suggested products";
  }

  switch (language) {
    case "es":
      return `Resultados para \"${trimmedQuery}\"`;
    case "pt":
      return `Resultados para \"${trimmedQuery}\"`;
    case "fr":
      return `Resultats pour \"${trimmedQuery}\"`;
    default:
      return `Results for \"${trimmedQuery}\"`;
  }
}

function buildProductListReply(
  items: ProductSearchItem[],
  language: string | null,
  query: string | null
) {
  return JSON.stringify({
    type: "product_list",
    title: buildProductListTitle(language, query),
    items: items.map((item) => ({
      id: item.woo_product_id,
      name: item.name,
      price: item.price,
      permalink: item.permalink,
      image: item.image,
      stock_status: item.stock_status,
    })),
  });
}

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

  // Initial messages payload
  const messages: ChatHistoryItem[] = [
    { role: "system", content: buildSystemPrompt(validAgent) },
    ...history,
    { role: "user", content: message },
  ];

  const fetchOpenAI = async (msgs: ChatHistoryItem[]) => {
    return (deps.fetcher ?? fetch)("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deps.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: deps.model ?? FALLBACK_AGENT_MODEL,
        temperature: 0.4,
        messages: msgs,
        tools: TOOLS, // Activate tools
        tool_choice: "auto",
      }),
    });
  };

  // 1st Round Trip
  let response = await fetchOpenAI(messages);

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

  let completion = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string; tool_calls?: OpenAIToolCall[] };
    }>;
  };

  const assistantMsg = completion.choices?.[0]?.message;
  let reply = assistantMsg?.content?.trim() || "";

  // Check for tool calls
  if (assistantMsg?.tool_calls && assistantMsg.tool_calls.length > 0) {
    // Append assistant's intention to call tools
    messages.push({
      role: "assistant",
      content: reply,
      tool_calls: assistantMsg.tool_calls,
    });

    let productResults: ProductSearchItem[] | null = null;
    let productQuery: string | null = null;

    // Execute tools
    for (const toolCall of assistantMsg.tool_calls) {
      if (toolCall.function.name === "search_products") {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (typeof args?.query === "string") {
            productQuery = args.query;
          }
          const products = await wooSearchProductsByApiKey(apiKey, args, {
            openaiApiKey: deps.openaiApiKey,
          });
          const resultStr = JSON.stringify(products);
          productResults = products;

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: resultStr,
          });
        } catch (err) {
          logger.error("[AI SaaS] Tool error:", err);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "Error retrieving products. Please try again later.",
          });
        }
      }
    }

    if (productResults && productResults.length > 0) {
      reply = buildProductListReply(
        productResults,
        validAgent.language ?? null,
        productQuery
      );
    } else {
    // 2nd Round Trip (with tool results)
    response = await fetchOpenAI(messages);
    if (!response.ok) {
      // If 2nd call fails, we just return what we have or generic error
      // Ideally we fallback or just return the tool output if possible, but let's error gracefully
      return {
        ok: false,
        status: 502,
        error: "The model could not process tool results.",
        fallbackUrl: validAgent.fallback_url ?? null,
      };
    }

    completion = await response.json();
    reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a final response.";
    }
  }

  // Save conversation
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
