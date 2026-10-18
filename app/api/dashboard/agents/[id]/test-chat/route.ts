import { NextResponse } from "next/server";
import { z } from "zod";
import { chatWithAgent, FALLBACK_AGENT_MODEL } from "@/lib/agents/chat-service";
import { createAdmin } from "@/lib/supabase/admin";
import { createServer } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";

const AGENT_MODEL = process.env.OPENAI_AGENT_MODEL ?? FALLBACK_AGENT_MODEL;

function bodySchema(messageRequired: string) {
  return z.object({
    message: z.string().trim().min(1, messageRequired).max(2000),
  });
}

type TestChatRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: TestChatRouteContext) {
  const { id } = await context.params;
  const { locale, t } = await getI18n();
  const e = t.api;
  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: e.notAuthenticated }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: e.invalidJson }, { status: 400 });
  }

  const parsed = bodySchema(e.messageRequired).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? e.invalidRequest },
      { status: 400 },
    );
  }

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id, user_id, api_key, shopify_integration_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (agentError || !agent) {
    return NextResponse.json({ error: e.agentNotFound }, { status: 404 });
  }

  if (!agent.api_key) {
    return NextResponse.json(
      { error: e.agentMissingKey },
      { status: 409 },
    );
  }

  const admin = createAdmin();
  let catalog: string | undefined;
  let currency: string | undefined;

  if (agent.shopify_integration_id) {
    const { data: shopify } = await admin
      .from("integrations_shopify")
      .select("id, is_active, currency")
      .eq("id", agent.shopify_integration_id)
      .maybeSingle();

    if (shopify?.is_active) {
      catalog = "shopify";
      currency = shopify.currency ?? undefined;
    }
  }

  const result = await chatWithAgent(
    {
      apiKey: agent.api_key,
      message: parsed.data.message,
      catalog,
      currency,
      skipQuota: true,
      persistConversation: false,
      locale,
    },
    {
      supabase: admin,
      openaiApiKey: process.env.OPENAI_API_KEY ?? "",
      model: AGENT_MODEL,
    },
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, fallback_url: result.fallbackUrl ?? null },
      { status: result.status },
    );
  }

  return NextResponse.json({
    reply: result.reply,
    fallback_url: result.fallbackUrl,
  });
}
