import {
  getWidgetAccentDefault,
  getWidgetAppearanceDefaults,
  widgetDefaults,
  widgetLimits,
  sanitizeHex,
  sanitizeWidgetFormat,
  sanitizeLauncherIcon,
  sanitizeLauncherStyle,
  sanitizePosition,
  sanitizeWidgetBoolean,
  sanitizeWidgetNumber,
} from "@/lib/widget/defaults";
import type { AgentRecord, WidgetAppearance, WidgetConfig } from "./types";

const BRAND_DEFAULT = widgetDefaults.brand;
const LABEL_DEFAULT = widgetDefaults.label;
const GREETING_DEFAULT = widgetDefaults.greeting;
const POSITION_DEFAULT = widgetDefaults.position;
const LAUNCHER_ICON_DEFAULT = widgetDefaults.launcherIcon;
const LAUNCHER_STYLE_DEFAULT = widgetDefaults.launcherStyle;
const FORMAT_DEFAULT = widgetDefaults.format;

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

function sanitizeImageUrl(value: string | null, max = 512) {
  if (!value) return null;
  const trimmed = value.replace(/[<>]/g, "").trim().slice(0, max);
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
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
  const format = sanitizeWidgetFormat(
    params.get("format") ?? agent.widget_format ?? FORMAT_DEFAULT
  );
  const accent = sanitizeHex(
    params.get("accent") ??
      agent.widget_accent ??
      getWidgetAccentDefault(format)
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
  const appearanceDefaults = getWidgetAppearanceDefaults(format);

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
  const width = sanitizeWidgetNumber(
    params.get("width") ?? agent.widget_width,
    widgetDefaults.width,
    widgetLimits.width.min,
    widgetLimits.width.max
  );
  const height = sanitizeWidgetNumber(
    params.get("height") ?? agent.widget_height,
    widgetDefaults.height,
    widgetLimits.height.min,
    widgetLimits.height.max
  );
  const offsetX = sanitizeWidgetNumber(
    params.get("offsetX") ?? agent.widget_offset_x,
    widgetDefaults.offsetX,
    widgetLimits.offsetX.min,
    widgetLimits.offsetX.max
  );
  const offsetY = sanitizeWidgetNumber(
    params.get("offsetY") ?? agent.widget_offset_y,
    widgetDefaults.offsetY,
    widgetLimits.offsetY.min,
    widgetLimits.offsetY.max
  );
  const launcherSize = sanitizeWidgetNumber(
    params.get("launcherSize") ?? agent.widget_launcher_size,
    widgetDefaults.launcherSize,
    widgetLimits.launcherSize.min,
    widgetLimits.launcherSize.max
  );
  const borderRadius = sanitizeWidgetNumber(
    params.get("borderRadius") ?? agent.widget_border_radius,
    widgetDefaults.borderRadius,
    widgetLimits.borderRadius.min,
    widgetLimits.borderRadius.max
  );
  const launcherIcon = sanitizeLauncherIcon(
    params.get("launcherIcon") ??
      agent.widget_launcher_icon ??
      LAUNCHER_ICON_DEFAULT
  );
  const launcherLogoUrl = sanitizeImageUrl(
    params.get("launcherLogoUrl") ?? agent.widget_launcher_logo_url,
    widgetLimits.launcherLogoUrl
  );
  const launcherStyle = sanitizeLauncherStyle(
    params.get("launcherStyle") ??
      agent.widget_launcher_style ??
      LAUNCHER_STYLE_DEFAULT
  );
  const bubbleSubtitle = escapeForJs(
    sanitizeText(
      params.get("bubbleSubtitle") ?? agent.widget_bubble_subtitle,
      widgetDefaults.bubbleSubtitle,
      widgetLimits.bubbleSubtitle
    )
  );
  const bubbleUseThree = sanitizeWidgetBoolean(
    params.get("bubbleUseThree") ?? agent.widget_bubble_use_three,
    widgetDefaults.bubbleUseThree
  );
  const bubbleWidth = sanitizeWidgetNumber(
    params.get("bubbleWidth") ?? agent.widget_bubble_width,
    widgetDefaults.bubbleWidth,
    widgetLimits.bubbleWidth.min,
    widgetLimits.bubbleWidth.max
  );
  const bubbleRadius = sanitizeWidgetNumber(
    params.get("bubbleRadius") ?? agent.widget_bubble_radius,
    widgetDefaults.bubbleRadius,
    widgetLimits.bubbleRadius.min,
    widgetLimits.bubbleRadius.max
  );

  const brandInitial = escapeForJs(
    (brandName.charAt(0).toUpperCase() || "A").slice(0, 1)
  );

  // Custom colors with modern neutral defaults.
  const colorHeaderBg = sanitizeHex(
    params.get("colorHeaderBg") ??
      agent.widget_color_header_bg ??
      appearanceDefaults.colorHeaderBg
  );
  const colorHeaderText = sanitizeHex(
    params.get("colorHeaderText") ??
      agent.widget_color_header_text ??
      appearanceDefaults.colorHeaderText
  );
  const colorChatBg = sanitizeHex(
    params.get("colorChatBg") ??
      agent.widget_color_chat_bg ??
      appearanceDefaults.colorChatBg
  );
  const colorUserBubbleBg = sanitizeHex(
    params.get("colorUserBubbleBg") ??
      agent.widget_color_user_bubble_bg ??
      appearanceDefaults.colorUserBubbleBg
  );
  const colorUserBubbleText = sanitizeHex(
    params.get("colorUserBubbleText") ??
      agent.widget_color_user_bubble_text ??
      appearanceDefaults.colorUserBubbleText
  );
  const colorBotBubbleBg = sanitizeHex(
    params.get("colorBotBubbleBg") ??
      agent.widget_color_bot_bubble_bg ??
      appearanceDefaults.colorBotBubbleBg
  );
  const colorBotBubbleText = sanitizeHex(
    params.get("colorBotBubbleText") ??
      agent.widget_color_bot_bubble_text ??
      appearanceDefaults.colorBotBubbleText
  );
  const colorToggleBg = sanitizeHex(
    params.get("colorToggleBg") ??
      agent.widget_color_toggle_bg ??
      appearanceDefaults.colorToggleBg
  );
  const colorToggleText = sanitizeHex(
    params.get("colorToggleText") ??
      agent.widget_color_toggle_text ??
      appearanceDefaults.colorToggleText
  );
  const colorBubbleBg = sanitizeHex(
    params.get("colorBubbleBg") ??
      agent.widget_color_bubble_bg ??
      appearanceDefaults.colorBubbleBg
  );
  const colorBubbleText = sanitizeHex(
    params.get("colorBubbleText") ??
      agent.widget_color_bubble_text ??
      appearanceDefaults.colorBubbleText
  );
  const colorBubbleSubtext = sanitizeHex(
    params.get("colorBubbleSubtext") ??
      agent.widget_color_bubble_subtext ??
      appearanceDefaults.colorBubbleSubtext
  );
  const colorBubbleBorder = sanitizeHex(
    params.get("colorBubbleBorder") ??
      agent.widget_color_bubble_border ??
      appearanceDefaults.colorBubbleBorder
  );
  const colorBubbleGlow = sanitizeHex(
    params.get("colorBubbleGlow") ??
      agent.widget_color_bubble_glow ??
      appearanceDefaults.colorBubbleGlow
  );

  return {
    format,
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
    launcherIcon,
    launcherLogoUrl,
    launcherStyle,
    bubbleSubtitle,
    bubbleUseThree,
    bubbleWidth,
    bubbleRadius,
    position,
    width,
    height,
    offsetX,
    offsetY,
    launcherSize,
    borderRadius,
    colorHeaderBg,
    colorHeaderText,
    colorChatBg,
    colorUserBubbleBg,
    colorUserBubbleText,
    colorBotBubbleBg,
    colorBotBubbleText,
    colorToggleBg,
    colorToggleText,
    colorBubbleBg,
    colorBubbleText,
    colorBubbleSubtext,
    colorBubbleBorder,
    colorBubbleGlow,
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
    format: appearance.format,
    accent: appearance.accent,
    brandName: appearance.brandName,
    brandInitial: appearance.brandInitial,
    collapsedLabel: appearance.collapsedLabel,
    greeting: appearance.greeting,
    launcherIcon: appearance.launcherIcon,
    launcherLogoUrl: appearance.launcherLogoUrl,
    launcherStyle: appearance.launcherStyle,
    bubbleSubtitle: appearance.bubbleSubtitle,
    bubbleUseThree: appearance.bubbleUseThree,
    bubbleWidth: appearance.bubbleWidth,
    bubbleRadius: appearance.bubbleRadius,
    position: appearance.position,
    width: appearance.width,
    height: appearance.height,
    offsetX: appearance.offsetX,
    offsetY: appearance.offsetY,
    launcherSize: appearance.launcherSize,
    borderRadius: appearance.borderRadius,
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
      colorBubbleBg: appearance.colorBubbleBg,
      colorBubbleText: appearance.colorBubbleText,
      colorBubbleSubtext: appearance.colorBubbleSubtext,
      colorBubbleBorder: appearance.colorBubbleBorder,
      colorBubbleGlow: appearance.colorBubbleGlow,
    },
  };
}
