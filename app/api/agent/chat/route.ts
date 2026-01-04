//C:\ai-saas\app\api\agent\chat\route.ts
import { NextResponse } from "next/server";
import { chatWithAgent, FALLBACK_AGENT_MODEL } from "@/lib/agents/chat-service";
import { createAdmin } from "@/lib/supabase/admin";

const AGENT_MODEL = process.env.OPENAI_AGENT_MODEL ?? FALLBACK_AGENT_MODEL;

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const catalog = url.searchParams.get("catalog") ?? null;
    const currency = url.searchParams.get("currency") ?? null;

    const body = await req.json().catch(() => ({}));
    const apiKey = String(body.api_key || "").trim();
    const message = String(body.message || "").trim();

    const result = await chatWithAgent(
      {
        apiKey,
        message,
        catalog: catalog ?? undefined,
        currency: currency ?? undefined,
      },
      {
        supabase: createAdmin(),
        openaiApiKey: process.env.OPENAI_API_KEY ?? "",
        model: AGENT_MODEL,
      }
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, fallback_url: result.fallbackUrl ?? null },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { reply: result.reply, fallback_url: result.fallbackUrl },
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
