//C:\ai-saas\app\api\widget\route.ts
import { NextResponse } from "next/server";
import { renderWidgetScript } from "@/lib/widget/clientScript";
import { WidgetConfig } from "@/lib/widget/types";
import {
  getWidgetAccentDefault,
  getWidgetAppearanceDefaults,
  sanitizeWidgetLanguage,
  sanitizeWidgetFormat,
  sanitizeLauncherIcon,
  sanitizeLauncherStyle,
  sanitizePosition,
  sanitizeWidgetBoolean,
  sanitizeWidgetNumber,
  widgetDefaults,
  widgetLimits,
} from "@/lib/widget/defaults";

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

function normalizeImageUrl(value: string | null, fallback: string | null = null) {
  const trimmed = (value ?? "").replace(/[<>]/g, "").trim();
  if (!trimmed) return fallback;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString().slice(0, widgetLimits.launcherLogoUrl);
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function buildPreviewOverrides(
  params: URLSearchParams
): Partial<WidgetConfig> {
  const overrides: Partial<WidgetConfig> = {};

  const languageParam = getParam(params, "language");
  if (languageParam !== null) {
    overrides.language = sanitizeWidgetLanguage(languageParam);
  }

  const formatParam = getParam(params, "format");
  const previewFormat =
    formatParam !== null
      ? sanitizeWidgetFormat(formatParam)
      : widgetDefaults.format;
  if (formatParam !== null) {
    overrides.format = previewFormat;
  }

  const accentParam = getParam(params, "accent");
  if (accentParam !== null) {
    overrides.accent = normalizeHex(
      accentParam,
      getWidgetAccentDefault(previewFormat)
    );
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

  const launcherIconParam = getParam(params, "launcherIcon");
  if (launcherIconParam !== null) {
    overrides.launcherIcon = sanitizeLauncherIcon(launcherIconParam);
  }

  const launcherLogoUrlParam = getParam(params, "launcherLogoUrl");
  if (launcherLogoUrlParam !== null) {
    overrides.launcherLogoUrl = normalizeImageUrl(launcherLogoUrlParam);
  }

  const launcherStyleParam = getParam(params, "launcherStyle");
  if (launcherStyleParam !== null) {
    overrides.launcherStyle = sanitizeLauncherStyle(launcherStyleParam);
  }

  const bubbleSubtitleParam = getParam(params, "bubbleSubtitle");
  if (bubbleSubtitleParam !== null) {
    overrides.bubbleSubtitle = sanitizeText(
      bubbleSubtitleParam,
      widgetDefaults.bubbleSubtitle,
      widgetLimits.bubbleSubtitle
    );
  }

  const bubbleUseThreeParam = getParam(params, "bubbleUseThree");
  if (bubbleUseThreeParam !== null) {
    overrides.bubbleUseThree = sanitizeWidgetBoolean(
      bubbleUseThreeParam,
      widgetDefaults.bubbleUseThree
    );
  }

  const positionParam = getParam(params, "position");
  if (positionParam !== null) {
    overrides.position = sanitizePosition(positionParam);
  }

  const widthParam = getParam(params, "width");
  if (widthParam !== null) {
    overrides.width = sanitizeWidgetNumber(
      widthParam,
      widgetDefaults.width,
      widgetLimits.width.min,
      widgetLimits.width.max
    );
  }

  const heightParam = getParam(params, "height");
  if (heightParam !== null) {
    overrides.height = sanitizeWidgetNumber(
      heightParam,
      widgetDefaults.height,
      widgetLimits.height.min,
      widgetLimits.height.max
    );
  }

  const offsetXParam = getParam(params, "offsetX");
  if (offsetXParam !== null) {
    overrides.offsetX = sanitizeWidgetNumber(
      offsetXParam,
      widgetDefaults.offsetX,
      widgetLimits.offsetX.min,
      widgetLimits.offsetX.max
    );
  }

  const offsetYParam = getParam(params, "offsetY");
  if (offsetYParam !== null) {
    overrides.offsetY = sanitizeWidgetNumber(
      offsetYParam,
      widgetDefaults.offsetY,
      widgetLimits.offsetY.min,
      widgetLimits.offsetY.max
    );
  }

  const launcherSizeParam = getParam(params, "launcherSize");
  if (launcherSizeParam !== null) {
    overrides.launcherSize = sanitizeWidgetNumber(
      launcherSizeParam,
      widgetDefaults.launcherSize,
      widgetLimits.launcherSize.min,
      widgetLimits.launcherSize.max
    );
  }

  const borderRadiusParam = getParam(params, "borderRadius");
  if (borderRadiusParam !== null) {
    overrides.borderRadius = sanitizeWidgetNumber(
      borderRadiusParam,
      widgetDefaults.borderRadius,
      widgetLimits.borderRadius.min,
      widgetLimits.borderRadius.max
    );
  }

  const bubbleWidthParam = getParam(params, "bubbleWidth");
  if (bubbleWidthParam !== null) {
    overrides.bubbleWidth = sanitizeWidgetNumber(
      bubbleWidthParam,
      widgetDefaults.bubbleWidth,
      widgetLimits.bubbleWidth.min,
      widgetLimits.bubbleWidth.max
    );
  }

  const bubbleRadiusParam = getParam(params, "bubbleRadius");
  if (bubbleRadiusParam !== null) {
    overrides.bubbleRadius = sanitizeWidgetNumber(
      bubbleRadiusParam,
      widgetDefaults.bubbleRadius,
      widgetLimits.bubbleRadius.min,
      widgetLimits.bubbleRadius.max
    );
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
  const colorBubbleBg = getParam(params, "colorBubbleBg");
  const colorBubbleText = getParam(params, "colorBubbleText");
  const colorBubbleSubtext = getParam(params, "colorBubbleSubtext");
  const colorBubbleBorder = getParam(params, "colorBubbleBorder");
  const colorBubbleGlow = getParam(params, "colorBubbleGlow");
  const appearanceDefaults = getWidgetAppearanceDefaults(previewFormat);

  const hasAppearanceOverrides = [
    formatParam,
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
      colorBubbleBg: normalizeHex(
        colorBubbleBg,
        appearanceDefaults.colorBubbleBg
      ),
      colorBubbleText: normalizeHex(
        colorBubbleText,
        appearanceDefaults.colorBubbleText
      ),
      colorBubbleSubtext: normalizeHex(
        colorBubbleSubtext,
        appearanceDefaults.colorBubbleSubtext
      ),
      colorBubbleBorder: normalizeHex(
        colorBubbleBorder,
        appearanceDefaults.colorBubbleBorder
      ),
      colorBubbleGlow: normalizeHex(
        colorBubbleGlow,
        appearanceDefaults.colorBubbleGlow
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
  const autoOpen = isPreview && url.searchParams.get("open") === "1";

  // Create a minimal config object just to kickstart the client script
  // The client script will now handle fetching the full config.
  // Unless it's preview, where we might pass some overrides directly.

  // Pass overrides if preview
  const overrides = isPreview ? buildPreviewOverrides(url.searchParams) : {};

  const js = renderWidgetScript(key, url.origin, overrides, {
    isPreview,
    autoOpen,
  });

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
