//C:\ai-saas\app\api\widget\config\route.ts

import { NextResponse } from "next/server";
import {
  ensureDomainAllowed,
  resolveRequestHost,
} from "@/lib/security/domains";
import { createAdmin } from "@/lib/supabase/admin";
import { WidgetConfig } from "@/lib/widget/types";
import {
  getWidgetAccentDefault,
  getWidgetAppearanceDefaults,
  getWidgetCopyDefaults,
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

function resolveRequestLanguage(
  req: Request,
  configuredLanguage: string,
  pageLanguage: string | null
) {
  if (configuredLanguage !== "auto") return configuredLanguage;

  const embeddedPageLanguage = sanitizeWidgetLanguage(
    pageLanguage?.trim().slice(0, 2)
  );
  if (embeddedPageLanguage !== "auto") return embeddedPageLanguage;

  const accepted = req.headers.get("accept-language") ?? "";
  for (const part of accepted.split(",")) {
    const language = sanitizeWidgetLanguage(part.trim().slice(0, 2));
    if (language !== "auto") return language;
  }

  return "en";
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

  try {
    ensureDomainAllowed(
      agent,
      resolveRequestHost(req, { allowSameSiteFallback: isPreview }),
      { allowDashboardPreview: isPreview },
    );
  } catch {
    return NextResponse.json(
      { error: "This domain is not allowed for this agent." },
      {
        status: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
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

  const baseLanguage = sanitizeWidgetLanguage(agent.language);
  const resolvedLanguage = resolveRequestLanguage(
    req,
    baseLanguage,
    url.searchParams.get("pageLanguage")
  );
  const copyDefaults = getWidgetCopyDefaults(resolvedLanguage);
  const baseFormat = sanitizeWidgetFormat(agent.widget_format);
  const baseAccent = normalizeHex(
    agent.widget_accent,
    getWidgetAccentDefault(baseFormat)
  );
  const baseBrandName = sanitizeText(
    agent.widget_brand,
    widgetDefaults.brand,
    widgetLimits.brand
  );
  const baseLabel = sanitizeText(
    agent.widget_label,
    copyDefaults.label,
    widgetLimits.label
  );
  const baseGreeting = sanitizeText(
    agent.widget_greeting,
    copyDefaults.greeting,
    widgetLimits.greeting
  );
  const baseHumanSupportText = sanitizeText(
    agent.widget_human_support_text,
    copyDefaults.humanSupportText,
    widgetLimits.humanSupportText
  );
  const appearanceDefaults = getWidgetAppearanceDefaults(baseFormat);
  const baseLauncherIcon = sanitizeLauncherIcon(agent.widget_launcher_icon);
  const baseLauncherLogoUrl = normalizeImageUrl(agent.widget_launcher_logo_url);
  const baseLauncherStyle = sanitizeLauncherStyle(agent.widget_launcher_style);
  const baseBubbleSubtitle = sanitizeText(
    agent.widget_bubble_subtitle,
    widgetDefaults.bubbleSubtitle,
    widgetLimits.bubbleSubtitle
  );
  const baseBubbleUseThree = sanitizeWidgetBoolean(
    agent.widget_bubble_use_three,
    widgetDefaults.bubbleUseThree
  );
  const basePosition = sanitizePosition(agent.widget_position);
  const baseWidth = sanitizeWidgetNumber(
    agent.widget_width,
    widgetDefaults.width,
    widgetLimits.width.min,
    widgetLimits.width.max
  );
  const baseHeight = sanitizeWidgetNumber(
    agent.widget_height,
    widgetDefaults.height,
    widgetLimits.height.min,
    widgetLimits.height.max
  );
  const baseOffsetX = sanitizeWidgetNumber(
    agent.widget_offset_x,
    widgetDefaults.offsetX,
    widgetLimits.offsetX.min,
    widgetLimits.offsetX.max
  );
  const baseOffsetY = sanitizeWidgetNumber(
    agent.widget_offset_y,
    widgetDefaults.offsetY,
    widgetLimits.offsetY.min,
    widgetLimits.offsetY.max
  );
  const baseLauncherSize = sanitizeWidgetNumber(
    agent.widget_launcher_size,
    widgetDefaults.launcherSize,
    widgetLimits.launcherSize.min,
    widgetLimits.launcherSize.max
  );
  const baseBorderRadius = sanitizeWidgetNumber(
    agent.widget_border_radius,
    widgetDefaults.borderRadius,
    widgetLimits.borderRadius.min,
    widgetLimits.borderRadius.max
  );
  const baseBubbleWidth = sanitizeWidgetNumber(
    agent.widget_bubble_width,
    widgetDefaults.bubbleWidth,
    widgetLimits.bubbleWidth.min,
    widgetLimits.bubbleWidth.max
  );
  const baseBubbleRadius = sanitizeWidgetNumber(
    agent.widget_bubble_radius,
    widgetDefaults.bubbleRadius,
    widgetLimits.bubbleRadius.min,
    widgetLimits.bubbleRadius.max
  );
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
    colorBubbleBg: normalizeHex(
      agent.widget_color_bubble_bg,
      appearanceDefaults.colorBubbleBg
    ),
    colorBubbleText: normalizeHex(
      agent.widget_color_bubble_text,
      appearanceDefaults.colorBubbleText
    ),
    colorBubbleSubtext: normalizeHex(
      agent.widget_color_bubble_subtext,
      appearanceDefaults.colorBubbleSubtext
    ),
    colorBubbleBorder: normalizeHex(
      agent.widget_color_bubble_border,
      appearanceDefaults.colorBubbleBorder
    ),
    colorBubbleGlow: normalizeHex(
      agent.widget_color_bubble_glow,
      appearanceDefaults.colorBubbleGlow
    ),
  };

  const config: WidgetConfig = {
    key: agent.api_key,
    chatEndpoint,
    language: resolvedLanguage,
    format: baseFormat,
    accent: baseAccent,
    brandName: baseBrandName,
    brandInitial: (baseBrandName.charAt(0).toUpperCase() || "A").slice(0, 1),
    collapsedLabel: baseLabel,
    greeting: baseGreeting,
    humanSupportText: baseHumanSupportText,
    launcherIcon: baseLauncherIcon,
    launcherLogoUrl: baseLauncherLogoUrl,
    launcherStyle: baseLauncherStyle,
    bubbleSubtitle: baseBubbleSubtitle,
    bubbleUseThree: baseBubbleUseThree,
    position: basePosition,
    width: baseWidth,
    height: baseHeight,
    offsetX: baseOffsetX,
    offsetY: baseOffsetY,
    launcherSize: baseLauncherSize,
    borderRadius: baseBorderRadius,
    bubbleWidth: baseBubbleWidth,
    bubbleRadius: baseBubbleRadius,
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

    const launcherIconParam = getParam(params, "launcherIcon");
    if (launcherIconParam !== null) {
      config.launcherIcon = sanitizeLauncherIcon(launcherIconParam);
    }

    const launcherLogoUrlParam = getParam(params, "launcherLogoUrl");
    if (launcherLogoUrlParam !== null) {
      config.launcherLogoUrl = normalizeImageUrl(
        launcherLogoUrlParam,
        config.launcherLogoUrl ?? null
      );
    }

    const launcherStyleParam = getParam(params, "launcherStyle");
    if (launcherStyleParam !== null) {
      config.launcherStyle = sanitizeLauncherStyle(launcherStyleParam);
    }

    const bubbleSubtitleParam = getParam(params, "bubbleSubtitle");
    if (bubbleSubtitleParam !== null) {
      config.bubbleSubtitle = sanitizeText(
        bubbleSubtitleParam,
        config.bubbleSubtitle ?? widgetDefaults.bubbleSubtitle,
        widgetLimits.bubbleSubtitle
      );
    }

    const bubbleUseThreeParam = getParam(params, "bubbleUseThree");
    if (bubbleUseThreeParam !== null) {
      config.bubbleUseThree = sanitizeWidgetBoolean(
        bubbleUseThreeParam,
        config.bubbleUseThree ?? widgetDefaults.bubbleUseThree
      );
    }

    const formatParam = getParam(params, "format");
    if (formatParam !== null) {
      const previousAccent = getWidgetAccentDefault(config.format);
      const previousDefaults = getWidgetAppearanceDefaults(config.format);
      const nextFormat = sanitizeWidgetFormat(formatParam);
      const nextAccent = getWidgetAccentDefault(nextFormat);
      const nextDefaults = getWidgetAppearanceDefaults(nextFormat);

      config.format = nextFormat;
      if (config.accent === previousAccent) {
        config.accent = nextAccent;
      }
      config.appearance = {
        colorHeaderBg:
          config.appearance.colorHeaderBg === previousDefaults.colorHeaderBg
            ? nextDefaults.colorHeaderBg
            : config.appearance.colorHeaderBg,
        colorHeaderText:
          config.appearance.colorHeaderText === previousDefaults.colorHeaderText
            ? nextDefaults.colorHeaderText
            : config.appearance.colorHeaderText,
        colorChatBg:
          config.appearance.colorChatBg === previousDefaults.colorChatBg
            ? nextDefaults.colorChatBg
            : config.appearance.colorChatBg,
        colorUserBubbleBg:
          config.appearance.colorUserBubbleBg === previousDefaults.colorUserBubbleBg
            ? nextDefaults.colorUserBubbleBg
            : config.appearance.colorUserBubbleBg,
        colorUserBubbleText:
          config.appearance.colorUserBubbleText === previousDefaults.colorUserBubbleText
            ? nextDefaults.colorUserBubbleText
            : config.appearance.colorUserBubbleText,
        colorBotBubbleBg:
          config.appearance.colorBotBubbleBg === previousDefaults.colorBotBubbleBg
            ? nextDefaults.colorBotBubbleBg
            : config.appearance.colorBotBubbleBg,
        colorBotBubbleText:
          config.appearance.colorBotBubbleText === previousDefaults.colorBotBubbleText
            ? nextDefaults.colorBotBubbleText
            : config.appearance.colorBotBubbleText,
        colorToggleBg:
          config.appearance.colorToggleBg === previousDefaults.colorToggleBg
            ? nextDefaults.colorToggleBg
            : config.appearance.colorToggleBg,
        colorToggleText:
          config.appearance.colorToggleText === previousDefaults.colorToggleText
            ? nextDefaults.colorToggleText
            : config.appearance.colorToggleText,
        colorBubbleBg:
          config.appearance.colorBubbleBg === previousDefaults.colorBubbleBg
            ? nextDefaults.colorBubbleBg
            : config.appearance.colorBubbleBg,
        colorBubbleText:
          config.appearance.colorBubbleText === previousDefaults.colorBubbleText
            ? nextDefaults.colorBubbleText
            : config.appearance.colorBubbleText,
        colorBubbleSubtext:
          config.appearance.colorBubbleSubtext === previousDefaults.colorBubbleSubtext
            ? nextDefaults.colorBubbleSubtext
            : config.appearance.colorBubbleSubtext,
        colorBubbleBorder:
          config.appearance.colorBubbleBorder === previousDefaults.colorBubbleBorder
            ? nextDefaults.colorBubbleBorder
            : config.appearance.colorBubbleBorder,
        colorBubbleGlow:
          config.appearance.colorBubbleGlow === previousDefaults.colorBubbleGlow
            ? nextDefaults.colorBubbleGlow
            : config.appearance.colorBubbleGlow,
      };
    }

    const languageParam = getParam(params, "language");
    if (languageParam !== null) {
      config.language = sanitizeWidgetLanguage(languageParam);
    }

    const positionParam = getParam(params, "position");
    if (positionParam !== null) {
      config.position =
        positionParam === "left" || positionParam === "right"
          ? positionParam
          : config.position;
    }

    const widthParam = getParam(params, "width");
    if (widthParam !== null) {
      config.width = sanitizeWidgetNumber(
        widthParam,
        config.width ?? widgetDefaults.width,
        widgetLimits.width.min,
        widgetLimits.width.max
      );
    }

    const heightParam = getParam(params, "height");
    if (heightParam !== null) {
      config.height = sanitizeWidgetNumber(
        heightParam,
        config.height ?? widgetDefaults.height,
        widgetLimits.height.min,
        widgetLimits.height.max
      );
    }

    const offsetXParam = getParam(params, "offsetX");
    if (offsetXParam !== null) {
      config.offsetX = sanitizeWidgetNumber(
        offsetXParam,
        config.offsetX ?? widgetDefaults.offsetX,
        widgetLimits.offsetX.min,
        widgetLimits.offsetX.max
      );
    }

    const offsetYParam = getParam(params, "offsetY");
    if (offsetYParam !== null) {
      config.offsetY = sanitizeWidgetNumber(
        offsetYParam,
        config.offsetY ?? widgetDefaults.offsetY,
        widgetLimits.offsetY.min,
        widgetLimits.offsetY.max
      );
    }

    const launcherSizeParam = getParam(params, "launcherSize");
    if (launcherSizeParam !== null) {
      config.launcherSize = sanitizeWidgetNumber(
        launcherSizeParam,
        config.launcherSize ?? widgetDefaults.launcherSize,
        widgetLimits.launcherSize.min,
        widgetLimits.launcherSize.max
      );
    }

    const borderRadiusParam = getParam(params, "borderRadius");
    if (borderRadiusParam !== null) {
      config.borderRadius = sanitizeWidgetNumber(
        borderRadiusParam,
        config.borderRadius ?? widgetDefaults.borderRadius,
        widgetLimits.borderRadius.min,
        widgetLimits.borderRadius.max
      );
    }

    const bubbleWidthParam = getParam(params, "bubbleWidth");
    if (bubbleWidthParam !== null) {
      config.bubbleWidth = sanitizeWidgetNumber(
        bubbleWidthParam,
        config.bubbleWidth ?? widgetDefaults.bubbleWidth,
        widgetLimits.bubbleWidth.min,
        widgetLimits.bubbleWidth.max
      );
    }

    const bubbleRadiusParam = getParam(params, "bubbleRadius");
    if (bubbleRadiusParam !== null) {
      config.bubbleRadius = sanitizeWidgetNumber(
        bubbleRadiusParam,
        config.bubbleRadius ?? widgetDefaults.bubbleRadius,
        widgetLimits.bubbleRadius.min,
        widgetLimits.bubbleRadius.max
      );
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
    const colorBubbleBg = getParam(params, "colorBubbleBg");
    if (colorBubbleBg !== null) {
      appearanceOverrides.colorBubbleBg = normalizeHex(
        colorBubbleBg,
        config.appearance.colorBubbleBg
      );
    }
    const colorBubbleText = getParam(params, "colorBubbleText");
    if (colorBubbleText !== null) {
      appearanceOverrides.colorBubbleText = normalizeHex(
        colorBubbleText,
        config.appearance.colorBubbleText
      );
    }
    const colorBubbleSubtext = getParam(params, "colorBubbleSubtext");
    if (colorBubbleSubtext !== null) {
      appearanceOverrides.colorBubbleSubtext = normalizeHex(
        colorBubbleSubtext,
        config.appearance.colorBubbleSubtext
      );
    }
    const colorBubbleBorder = getParam(params, "colorBubbleBorder");
    if (colorBubbleBorder !== null) {
      appearanceOverrides.colorBubbleBorder = normalizeHex(
        colorBubbleBorder,
        config.appearance.colorBubbleBorder
      );
    }
    const colorBubbleGlow = getParam(params, "colorBubbleGlow");
    if (colorBubbleGlow !== null) {
      appearanceOverrides.colorBubbleGlow = normalizeHex(
        colorBubbleGlow,
        config.appearance.colorBubbleGlow
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
      // Avoid browser and CDN cache for live widget configuration.
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
      "CDN-Cache-Control": "no-store",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
