import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { WidgetConfig } from "@/lib/widget/types";
import { widgetDefaults } from "@/lib/widget/defaults";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "Missing key" },
      { status: 400 }
    );
  }

  const supabase = createAdmin();
  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("api_key", key)
    .maybeSingle();

  if (error || !agent) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  // Determine chat endpoint (integrate with Shopify logic if needed,
  // currently mimicking the existing logic simplistically or pointing to main chat)
  // For now, we can replicate the logic or just point to the standard endpoint.
  // The original route had logic to check for shopify integration.
  // Let's do a quick check for shopify integration if active.

  const chatUrl = new URL(`${url.origin}/api/agent/chat`);
  if (agent.api_key) {
    chatUrl.searchParams.set("key", agent.api_key);
  }

  if (agent.shopify_integration_id) {
     const { data: shopify } = await supabase
      .from("integrations_shopify")
      .select("id, is_active, currency")
      .eq("id", agent.shopify_integration_id)
      .maybeSingle();
      
      if (shopify?.is_active) {
        chatUrl.searchParams.set("catalog", "shopify");
        if (shopify.currency) {
          chatUrl.searchParams.set("currency", shopify.currency);
        }
      }
  }
  const chatEndpoint = chatUrl.toString();

  const config: WidgetConfig = {
    key: agent.api_key,
    chatEndpoint: chatEndpoint,
    accent: agent.widget_accent || widgetDefaults.accent,
    brandName: agent.widget_brand || widgetDefaults.brand,
    brandInitial: (agent.widget_brand || widgetDefaults.brand).charAt(0).toUpperCase(),
    collapsedLabel: agent.widget_label || widgetDefaults.label,
    greeting: agent.widget_greeting || widgetDefaults.greeting,
    humanSupportText: agent.widget_human_support_text || widgetDefaults.humanSupportText,
    position: agent.widget_position || widgetDefaults.position,
    appearance: {
        colorHeaderBg: agent.widget_color_header_bg || "#008069",
        colorHeaderText: agent.widget_color_header_text || "#ffffff",
        colorChatBg: agent.widget_color_chat_bg || "#efe7dd",
        colorUserBubbleBg: agent.widget_color_user_bubble_bg || "#d9fdd3",
        colorUserBubbleText: agent.widget_color_user_bubble_text || "#111b21",
        colorBotBubbleBg: agent.widget_color_bot_bubble_bg || "#ffffff",
        colorBotBubbleText: agent.widget_color_bot_bubble_text || "#111b21",
        colorToggleBg: agent.widget_color_toggle_bg || "#25D366",
        colorToggleText: agent.widget_color_toggle_text || "#ffffff",
    },
  };

  return NextResponse.json(config, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
