//C:\ai-saas\app\api\widget\config\route.ts

import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { WidgetConfig } from "@/lib/widget/types";
import {
  sanitizePosition,
  widgetDefaults,
  widgetLimits,
} from "@/lib/widget/defaults";

const appearanceDefaults = {
  colorHeaderBg: "#008069",
  colorHeaderText: "#ffffff",
  colorChatBg: "#efe7dd",
  colorUserBubbleBg: "#d9fdd3",
  colorUserBubbleText: "#111b21",
  colorBotBubbleBg: "#ffffff",
  colorBotBubbleText: "#111b21",
  colorToggleBg: "#25D366",
  colorToggleText: "#ffffff",
} as const;

function getParam(params: URLSearchParams, ...names: string[]): string | null {
  for (const name of names) {
    const value = params.get(name);
    if (value !== null) return value;
  }
  return null;
}

function normalizeHex(value: string | null, fallback: string) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return fallback;

  let hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
  return `#${hex.toLowerCase()}`;
}

function sanitizeText(value: string | null, fallback: string, max: number) {
  const cleaned = String(value ?? "")
    .replace(/[<>]/g, "")
    .trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, max);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const isPreview = url.searchParams.get("preview") === "1";

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const supabase = createAdmin();
  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("api_key", key)
    .maybeSingle();

  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
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

  const baseAccent = normalizeHex(agent.widget_accent, widgetDefaults.accent);
  const baseBrandName = sanitizeText(
    agent.widget_brand,
    widgetDefaults.brand,
    widgetLimits.brand
  );
  const baseLabel = sanitizeText(
    agent.widget_label,
    widgetDefaults.label,
    widgetLimits.label
  );
  const baseGreeting = sanitizeText(
    agent.widget_greeting,
    widgetDefaults.greeting,
    widgetLimits.greeting
  );
  const baseHumanSupportText = sanitizeText(
    agent.widget_human_support_text,
    widgetDefaults.humanSupportText,
    widgetLimits.humanSupportText
  );
  const basePosition = sanitizePosition(agent.widget_position);
  const baseAppearance = {
    colorHeaderBg: normalizeHex(
      agent.widget_color_header_bg,
      appearanceDefaults.colorHeaderBg
    ),
    colorHeaderText: normalizeHex(
      agent.widget_color_header_text,
      appearanceDefaults.colorHeaderText
    ),
    colorChatBg: normalizeHex(
      agent.widget_color_chat_bg,
      appearanceDefaults.colorChatBg
    ),
    colorUserBubbleBg: normalizeHex(
      agent.widget_color_user_bubble_bg,
      appearanceDefaults.colorUserBubbleBg
    ),
    colorUserBubbleText: normalizeHex(
      agent.widget_color_user_bubble_text,
      appearanceDefaults.colorUserBubbleText
    ),
    colorBotBubbleBg: normalizeHex(
      agent.widget_color_bot_bubble_bg,
      appearanceDefaults.colorBotBubbleBg
    ),
    colorBotBubbleText: normalizeHex(
      agent.widget_color_bot_bubble_text,
      appearanceDefaults.colorBotBubbleText
    ),
    colorToggleBg: normalizeHex(
      agent.widget_color_toggle_bg,
      appearanceDefaults.colorToggleBg
    ),
    colorToggleText: normalizeHex(
      agent.widget_color_toggle_text,
      appearanceDefaults.colorToggleText
    ),
  };

  const config: WidgetConfig = {
    key: agent.api_key,
    chatEndpoint,
    accent: baseAccent,
    brandName: baseBrandName,
    brandInitial: (baseBrandName.charAt(0).toUpperCase() || "A").slice(0, 1),
    collapsedLabel: baseLabel,
    greeting: baseGreeting,
    humanSupportText: baseHumanSupportText,
    position: basePosition,
    appearance: baseAppearance,
  };

  if (isPreview) {
    const params = url.searchParams;

    const accentParam = getParam(params, "accent");
    if (accentParam !== null) {
      config.accent = normalizeHex(accentParam, config.accent);
    }

    const brandParam = getParam(params, "brandName", "brand");
    if (brandParam !== null) {
      const brandName = sanitizeText(
        brandParam,
        config.brandName,
        widgetLimits.brand
      );
      config.brandName = brandName;
      config.brandInitial = (brandName.charAt(0).toUpperCase() || "A").slice(
        0,
        1
      );
    }

    const labelParam = getParam(params, "collapsedLabel", "label");
    if (labelParam !== null) {
      config.collapsedLabel = sanitizeText(
        labelParam,
        config.collapsedLabel,
        widgetLimits.label
      );
    }

    const greetingParam = getParam(params, "greeting");
    if (greetingParam !== null) {
      config.greeting = sanitizeText(
        greetingParam,
        config.greeting,
        widgetLimits.greeting
      );
    }

    const humanSupportParam = getParam(params, "humanSupportText");
    if (humanSupportParam !== null) {
      config.humanSupportText = sanitizeText(
        humanSupportParam,
        config.humanSupportText ?? widgetDefaults.humanSupportText,
        widgetLimits.humanSupportText
      );
    }

    const positionParam = getParam(params, "position");
    if (positionParam !== null) {
      config.position =
        positionParam === "left" || positionParam === "right"
          ? positionParam
          : config.position;
    }

    const appearanceOverrides: Partial<WidgetConfig["appearance"]> = {};
    const colorHeaderBg = getParam(params, "colorHeaderBg");
    if (colorHeaderBg !== null) {
      appearanceOverrides.colorHeaderBg = normalizeHex(
        colorHeaderBg,
        config.appearance.colorHeaderBg
      );
    }
    const colorHeaderText = getParam(params, "colorHeaderText");
    if (colorHeaderText !== null) {
      appearanceOverrides.colorHeaderText = normalizeHex(
        colorHeaderText,
        config.appearance.colorHeaderText
      );
    }
    const colorChatBg = getParam(params, "colorChatBg");
    if (colorChatBg !== null) {
      appearanceOverrides.colorChatBg = normalizeHex(
        colorChatBg,
        config.appearance.colorChatBg
      );
    }
    const colorUserBubbleBg = getParam(params, "colorUserBubbleBg");
    if (colorUserBubbleBg !== null) {
      appearanceOverrides.colorUserBubbleBg = normalizeHex(
        colorUserBubbleBg,
        config.appearance.colorUserBubbleBg
      );
    }
    const colorUserBubbleText = getParam(params, "colorUserBubbleText");
    if (colorUserBubbleText !== null) {
      appearanceOverrides.colorUserBubbleText = normalizeHex(
        colorUserBubbleText,
        config.appearance.colorUserBubbleText
      );
    }
    const colorBotBubbleBg = getParam(params, "colorBotBubbleBg");
    if (colorBotBubbleBg !== null) {
      appearanceOverrides.colorBotBubbleBg = normalizeHex(
        colorBotBubbleBg,
        config.appearance.colorBotBubbleBg
      );
    }
    const colorBotBubbleText = getParam(params, "colorBotBubbleText");
    if (colorBotBubbleText !== null) {
      appearanceOverrides.colorBotBubbleText = normalizeHex(
        colorBotBubbleText,
        config.appearance.colorBotBubbleText
      );
    }
    const colorToggleBg = getParam(params, "colorToggleBg");
    if (colorToggleBg !== null) {
      appearanceOverrides.colorToggleBg = normalizeHex(
        colorToggleBg,
        config.appearance.colorToggleBg
      );
    }
    const colorToggleText = getParam(params, "colorToggleText");
    if (colorToggleText !== null) {
      appearanceOverrides.colorToggleText = normalizeHex(
        colorToggleText,
        config.appearance.colorToggleText
      );
    }

    config.appearance = {
      ...config.appearance,
      ...appearanceOverrides,
    };
  }

  return NextResponse.json(config, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      // ✅ Evita cache en navegador + CDN (Vercel)
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
      "CDN-Cache-Control": "no-store",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
