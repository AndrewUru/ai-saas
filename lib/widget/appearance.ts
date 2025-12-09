import {
  widgetDefaults,
  widgetLimits,
  sanitizeHex,
  sanitizePosition,
} from "@/lib/widget/defaults";
import type { AgentRecord, WidgetAppearance, WidgetConfig } from "./types";

const ACCENT_DEFAULT = widgetDefaults.accent;
const BRAND_DEFAULT = widgetDefaults.brand;
const LABEL_DEFAULT = widgetDefaults.label;
const GREETING_DEFAULT = widgetDefaults.greeting;
const POSITION_DEFAULT = widgetDefaults.position;

function escapeForJs(str: string = "") {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}

function sanitizeText(value: string | null, fallback: string, max = 60) {
  if (!value) return fallback;
  const trimmed = value.replace(/[<>]/g, "").trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return { r, g, b };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = channel(r);
  const G = channel(g);
  const B = channel(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastTextColor(hex: string) {
  return relativeLuminance(hex) > 0.55 ? "#0f172a" : "#f8fafc";
}

export function buildAppearance(
  agent: AgentRecord,
  params: URLSearchParams
): WidgetAppearance {
  const accent = sanitizeHex(
    params.get("accent") ?? agent.widget_accent ?? ACCENT_DEFAULT
  );
  const accentContrast = contrastTextColor(accent);
  const accentShadow = rgba(accent, 0.32);
  const accentLight = rgba(accent, 0.16);
  const accentGradient = `linear-gradient(135deg, ${rgba(accent, 0.18)}, ${rgba(
    accent,
    0.4
  )})`;
  const isLightAccent = relativeLuminance(accent) > 0.8;
  const closeColor = isLightAccent ? "#0f172a" : "#fff";
  const closeBg = isLightAccent
    ? "rgba(15,23,42,.12)"
    : "rgba(255,255,255,.24)";

  const storedBrand = agent.widget_brand?.trim() || null;
  const storedLabel = agent.widget_label?.trim() || null;
  const storedGreeting = agent.widget_greeting?.trim() || null;

  const brandName = escapeForJs(
    sanitizeText(
      params.get("brand") ?? storedBrand,
      storedBrand ?? BRAND_DEFAULT,
      widgetLimits.brand
    )
  );

  const collapsedLabel = escapeForJs(
    sanitizeText(
      params.get("label") ?? storedLabel,
      storedLabel ?? LABEL_DEFAULT,
      widgetLimits.label
    )
  );

  const greeting = escapeForJs(
    sanitizeText(
      params.get("greeting") ?? storedGreeting,
      storedGreeting ?? GREETING_DEFAULT,
      widgetLimits.greeting
    )
  );

  const position = sanitizePosition(
    params.get("position") ?? agent.widget_position ?? POSITION_DEFAULT
  );

  const brandInitial = escapeForJs(
    (brandName.charAt(0).toUpperCase() || "A").slice(0, 1)
  );

  // Custom Colors with Fallbacks
  // Default Header: WhatsApp Teal (#008069)
  const colorHeaderBg = sanitizeHex(
    params.get("colorHeaderBg") ?? agent.widget_color_header_bg ?? "#008069"
  );
  // Default Header Text: White
  const colorHeaderText = sanitizeHex(
    params.get("colorHeaderText") ?? agent.widget_color_header_text ?? "#ffffff"
  );
  // Default Chat Bg: WhatsApp Beige (#efe7dd)
  const colorChatBg = sanitizeHex(
    params.get("colorChatBg") ?? agent.widget_color_chat_bg ?? "#efe7dd"
  );
  // Default User Bubble: WhatsApp Light Green (#d9fdd3)
  const colorUserBubbleBg = sanitizeHex(
    params.get("colorUserBubbleBg") ??
      agent.widget_color_user_bubble_bg ??
      "#d9fdd3"
  );
  // Default User Text: Black
  const colorUserBubbleText = sanitizeHex(
    params.get("colorUserBubbleText") ??
      agent.widget_color_user_bubble_text ??
      "#111b21"
  );
  // Default Bot Bubble: White
  const colorBotBubbleBg = sanitizeHex(
    params.get("colorBotBubbleBg") ?? agent.widget_color_bot_bubble_bg ?? "#ffffff"
  );
  // Default Bot Text: Black
  const colorBotBubbleText = sanitizeHex(
    params.get("colorBotBubbleText") ??
      agent.widget_color_bot_bubble_text ??
      "#111b21"
  );
  // Default Toggle Bg: WhatsApp Green (#25D366)
  const colorToggleBg = sanitizeHex(
    params.get("colorToggleBg") ?? agent.widget_color_toggle_bg ?? "#25D366"
  );
  // Default Toggle Text: White
  const colorToggleText = sanitizeHex(
    params.get("colorToggleText") ?? agent.widget_color_toggle_text ?? "#ffffff"
  );

  return {
    accent,
    accentContrast,
    accentShadow,
    accentLight,
    accentGradient,
    closeColor,
    closeBg,
    brandName,
    brandInitial,
    collapsedLabel,
    greeting,
    position,
    colorHeaderBg,
    colorHeaderText,
    colorChatBg,
    colorUserBubbleBg,
    colorUserBubbleText,
    colorBotBubbleBg,
    colorBotBubbleText,
    colorToggleBg,
    colorToggleText,
  };
}

export function buildConfig(
  key: string,
  chatEndpoint: string,
  appearance: WidgetAppearance
): WidgetConfig {
  return {
    key,
    chatEndpoint,
    accent: appearance.accent,
    brandName: appearance.brandName,
    brandInitial: appearance.brandInitial,
    collapsedLabel: appearance.collapsedLabel,
    greeting: appearance.greeting,
    position: appearance.position,
    appearance: {
      colorHeaderBg: appearance.colorHeaderBg,
      colorHeaderText: appearance.colorHeaderText,
      colorChatBg: appearance.colorChatBg,
      colorUserBubbleBg: appearance.colorUserBubbleBg,
      colorUserBubbleText: appearance.colorUserBubbleText,
      colorBotBubbleBg: appearance.colorBotBubbleBg,
      colorBotBubbleText: appearance.colorBotBubbleText,
      colorToggleBg: appearance.colorToggleBg,
      colorToggleText: appearance.colorToggleText,
    },
  };
}
