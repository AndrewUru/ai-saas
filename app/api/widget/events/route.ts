import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVENT_TYPES = new Set(["load", "open", "message_sent", "message_failed"]);

function jsonResponse(body: Record<string, unknown>, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

function normalizeText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function normalizeWordCount(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.min(Math.floor(numeric), 10000);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const apiKey = normalizeText(record.key, 160);
  const eventType = normalizeText(record.eventType, 40);

  if (!apiKey || !eventType || !EVENT_TYPES.has(eventType)) {
    return jsonResponse({ ok: false, error: "Invalid widget event" }, { status: 400 });
  }

  const supabase = createAdmin();
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("api_key", apiKey)
    .single();

  if (agentError || !agent) {
    return jsonResponse({ ok: false, error: "Agent not found" }, { status: 404 });
  }

  const { error } = await supabase.from("widget_events").insert({
    agent_id: agent.id,
    event_type: eventType,
    page_url: normalizeText(record.pageUrl, 2048),
    referrer: normalizeText(record.referrer, 2048),
    user_agent: normalizeText(req.headers.get("user-agent"), 512),
    word_count: normalizeWordCount(record.wordCount),
    metadata:
      record.metadata && typeof record.metadata === "object"
        ? record.metadata
        : {},
  });

  if (error) {
    console.error("[AI SaaS] widget event insert error:", error);
    return jsonResponse({ ok: false, error: "Could not record event" }, { status: 500 });
  }

  return jsonResponse({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: CORS_HEADERS,
  });
}
