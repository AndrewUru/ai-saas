//C:\ai-saas\app\api\widget\route.ts
import { NextResponse } from "next/server";
import { renderWidgetScript } from "@/lib/widget/clientScript";
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

function getParam(
  params: URLSearchParams,
  ...names: string[]
): string | null {
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
  const cleaned = String(value ?? "").replace(/[<>]/g, "").trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, max);
}

function buildPreviewOverrides(
  params: URLSearchParams
): Partial<WidgetConfig> {
  const overrides: Partial<WidgetConfig> = {};

  const accentParam = getParam(params, "accent");
  if (accentParam !== null) {
    overrides.accent = normalizeHex(accentParam, widgetDefaults.accent);
  }

  const brandParam = getParam(params, "brandName", "brand");
  if (brandParam !== null) {
    const brandName = sanitizeText(
      brandParam,
      widgetDefaults.brand,
      widgetLimits.brand
    );
    overrides.brandName = brandName;
    overrides.brandInitial = (brandName.charAt(0).toUpperCase() || "A").slice(
      0,
      1
    );
  }

  const labelParam = getParam(params, "collapsedLabel", "label");
  if (labelParam !== null) {
    overrides.collapsedLabel = sanitizeText(
      labelParam,
      widgetDefaults.label,
      widgetLimits.label
    );
  }

  const greetingParam = getParam(params, "greeting");
  if (greetingParam !== null) {
    overrides.greeting = sanitizeText(
      greetingParam,
      widgetDefaults.greeting,
      widgetLimits.greeting
    );
  }

  const humanSupportParam = getParam(params, "humanSupportText");
  if (humanSupportParam !== null) {
    overrides.humanSupportText = sanitizeText(
      humanSupportParam,
      widgetDefaults.humanSupportText,
      widgetLimits.humanSupportText
    );
  }

  const positionParam = getParam(params, "position");
  if (positionParam !== null) {
    overrides.position = sanitizePosition(positionParam);
  }

  const colorHeaderBg = getParam(params, "colorHeaderBg");
  const colorHeaderText = getParam(params, "colorHeaderText");
  const colorChatBg = getParam(params, "colorChatBg");
  const colorUserBubbleBg = getParam(params, "colorUserBubbleBg");
  const colorUserBubbleText = getParam(params, "colorUserBubbleText");
  const colorBotBubbleBg = getParam(params, "colorBotBubbleBg");
  const colorBotBubbleText = getParam(params, "colorBotBubbleText");
  const colorToggleBg = getParam(params, "colorToggleBg");
  const colorToggleText = getParam(params, "colorToggleText");

  const hasAppearanceOverrides = [
    colorHeaderBg,
    colorHeaderText,
    colorChatBg,
    colorUserBubbleBg,
    colorUserBubbleText,
    colorBotBubbleBg,
    colorBotBubbleText,
    colorToggleBg,
    colorToggleText,
  ].some((value) => value !== null);

  if (hasAppearanceOverrides) {
    overrides.appearance = {
      colorHeaderBg: normalizeHex(
        colorHeaderBg,
        appearanceDefaults.colorHeaderBg
      ),
      colorHeaderText: normalizeHex(
        colorHeaderText,
        appearanceDefaults.colorHeaderText
      ),
      colorChatBg: normalizeHex(
        colorChatBg,
        appearanceDefaults.colorChatBg
      ),
      colorUserBubbleBg: normalizeHex(
        colorUserBubbleBg,
        appearanceDefaults.colorUserBubbleBg
      ),
      colorUserBubbleText: normalizeHex(
        colorUserBubbleText,
        appearanceDefaults.colorUserBubbleText
      ),
      colorBotBubbleBg: normalizeHex(
        colorBotBubbleBg,
        appearanceDefaults.colorBotBubbleBg
      ),
      colorBotBubbleText: normalizeHex(
        colorBotBubbleText,
        appearanceDefaults.colorBotBubbleText
      ),
      colorToggleBg: normalizeHex(
        colorToggleBg,
        appearanceDefaults.colorToggleBg
      ),
      colorToggleText: normalizeHex(
        colorToggleText,
        appearanceDefaults.colorToggleText
      ),
    };
  }

  return overrides;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new NextResponse("// Missing key", {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    });
  }

  // Preview Mode: We allow overrides from query params for the Designer
  // Production Mode: We strictly use the key and fetch config from /api/widget/config
  const isPreview = url.searchParams.get("preview") === "1";

  // Create a minimal config object just to kickstart the client script
  // The client script will now handle fetching the full config.
  // Unless it's preview, where we might pass some overrides directly.

  // Pass overrides if preview
  const overrides = isPreview ? buildPreviewOverrides(url.searchParams) : {};

  const js = renderWidgetScript(key, url.origin, overrides);

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": isPreview
        ? "no-store, max-age=0"
        : "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
