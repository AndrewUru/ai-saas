//C:\ai-saas\app\api\agent\chat\route.ts
import { NextResponse } from "next/server";
import { chatWithAgent, FALLBACK_AGENT_MODEL } from "@/lib/agents/chat-service";
import { resolveRequestHost } from "@/lib/security/domains";
import { createAdmin } from "@/lib/supabase/admin";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

const AGENT_MODEL = process.env.OPENAI_AGENT_MODEL ?? FALLBACK_AGENT_MODEL;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-agent-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  init?: ResponseInit
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

function extractMessage(body: Record<string, unknown>) {
  if (typeof body.message === "string") {
    return body.message;
  }

  if (!Array.isArray(body.messages)) return null;

  for (let i = body.messages.length - 1; i >= 0; i -= 1) {
    const entry = body.messages[i];
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (record.role === "user" && typeof record.content === "string") {
      return record.content;
    }
  }

  for (let i = body.messages.length - 1; i >= 0; i -= 1) {
    const entry = body.messages[i];
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.content === "string") {
      return record.content;
    }
  }

  return null;
}

const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function extractConversationId(body: Record<string, unknown>) {
  const value = body.conversation_id;
  if (typeof value !== "string" || !CONVERSATION_ID_PATTERN.test(value)) return undefined;
  return `widget:${value}`;
}

export async function POST(req: Request) {
  const locale = getRequestLocale(req);
  const e = getMessages(locale).api;
  try {
    const url = new URL(req.url);
    const catalog = url.searchParams.get("catalog") ?? null;
    const currency = url.searchParams.get("currency") ?? null;
    const queryKey = url.searchParams.get("key") ?? "";
    const headerKey = req.headers.get("x-agent-key") ?? "";

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      console.warn("[AI SaaS] /api/agent/chat invalid JSON body");
      return jsonResponse({ error: e.invalidJson }, { status: 400 });
    }

    const bodyRecord =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const bodyKey = typeof bodyRecord.api_key === "string" ? bodyRecord.api_key : "";
    const apiKey = String(queryKey || headerKey || bodyKey || "").trim();
    const message = (extractMessage(bodyRecord) ?? "").trim();

    if (!apiKey) {
      console.warn("[AI SaaS] /api/agent/chat 400: missing agent key");
      return jsonResponse({ error: e.missingKey }, { status: 400 });
    }

    if (!message) {
      console.warn("[AI SaaS] /api/agent/chat 400: missing message");
      return jsonResponse(
        { error: e.missingMessage },
        { status: 400 }
      );
    }

    const result = await chatWithAgent(
      {
        apiKey,
        message,
        catalog: catalog ?? undefined,
        currency: currency ?? undefined,
        requestHost: resolveRequestHost(req),
        locale,
        conversationId: extractConversationId(bodyRecord),
        channel: "widget",
      },
      {
        supabase: createAdmin(),
        openaiApiKey: process.env.OPENAI_API_KEY ?? "",
        model: AGENT_MODEL,
      }
    );

    if (!result.ok) {
      const errorStatus = result.status === 404 ? 400 : result.status;
      if (errorStatus === 400) {
        console.warn("[AI SaaS] /api/agent/chat 400:", result.error);
      }

      return jsonResponse(
        { error: result.error, fallback_url: result.fallbackUrl ?? null },
        { status: errorStatus }
      );
    }

    return jsonResponse({ reply: result.reply, fallback_url: result.fallbackUrl });
  } catch (err) {
    console.error("[AI SaaS] Error en /api/agent/chat:", err);
    return jsonResponse(
      { error: e.internal },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: CORS_HEADERS,
  });
}
