import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth/requireUser";
import { getSiteUrlFromHeaders } from "@/lib/site";
import {
  sanitizeHex,
  sanitizeWidgetFormat,
  sanitizeLauncherIcon,
  sanitizeLauncherStyle,
  sanitizePosition,
  sanitizeWidgetBoolean,
  sanitizeWidgetNumber,
  widgetDefaults,
  widgetLimits,
} from "@/lib/widget/defaults";
import WidgetDesigner from "../WidgetDesigner";

const WIDGET_AGENT_SELECT =
  "id, name, api_key, language, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_format, widget_launcher_icon, widget_launcher_logo_url, widget_launcher_style, widget_bubble_subtitle, widget_bubble_use_three, widget_bubble_width, widget_bubble_radius, widget_position, widget_width, widget_height, widget_offset_x, widget_offset_y, widget_launcher_size, widget_border_radius, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text, widget_color_bubble_bg, widget_color_bubble_text, widget_color_bubble_subtext, widget_color_bubble_border, widget_color_bubble_glow";
const WIDGET_AGENT_SELECT_LEGACY =
  "id, name, api_key, language, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_format, widget_launcher_icon, widget_launcher_logo_url, widget_position, widget_width, widget_height, widget_offset_x, widget_offset_y, widget_launcher_size, widget_border_radius, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text";
const WIDGET_AGENT_SELECT_MINIMAL =
  "id, name, api_key, language, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_launcher_icon, widget_launcher_logo_url, widget_position, widget_width, widget_height, widget_offset_x, widget_offset_y, widget_launcher_size, widget_border_radius, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text";

function isMissingSelectedWidgetColumn(error: unknown) {
  const maybeError = error as
    | { code?: string; message?: string; details?: string }
    | null
    | undefined;
  const text = `${maybeError?.message ?? ""} ${maybeError?.details ?? ""}`;
  return maybeError?.code === "42703" && text.includes("widget_");
}

function normalizeWidgetText(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function normalizeWidgetUrl(value: string, max: number): string | null {
  const trimmed = value.replace(/[<>]/g, "").trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString().slice(0, max);
    }
  } catch {
    return null;
  }

  return null;
}

async function updateWidget(formData: FormData) {
  "use server";

  const { supabase, user } = await requireUser();
  const agentId = String(formData.get("agent_id") ?? "");
  if (!agentId) redirect("/dashboard/agents");

  const accentRaw = String(formData.get("widget_accent") ?? "");
  const brandRaw = String(formData.get("widget_brand") ?? "");
  const labelRaw = String(formData.get("widget_label") ?? "");
  const greetingRaw = String(formData.get("widget_greeting") ?? "");
  const formatRaw = String(formData.get("widget_format") ?? "");
  const launcherStyleRaw = String(formData.get("widget_launcher_style") ?? "");
  const bubbleSubtitleRaw = String(formData.get("widget_bubble_subtitle") ?? "");
  const bubbleUseThreeRaw = String(
    formData.get("widget_bubble_use_three") ?? "",
  );
  const bubbleWidthRaw = String(formData.get("widget_bubble_width") ?? "");
  const bubbleRadiusRaw = String(formData.get("widget_bubble_radius") ?? "");
  const positionRaw = String(formData.get("widget_position") ?? "");
  const widthRaw = String(formData.get("widget_width") ?? "");
  const heightRaw = String(formData.get("widget_height") ?? "");
  const offsetXRaw = String(formData.get("widget_offset_x") ?? "");
  const offsetYRaw = String(formData.get("widget_offset_y") ?? "");
  const launcherSizeRaw = String(formData.get("widget_launcher_size") ?? "");
  const borderRadiusRaw = String(formData.get("widget_border_radius") ?? "");
  const humanSupportRaw = String(
    formData.get("widget_human_support_text") ?? "",
  );
  const colorHeaderBgRaw = String(formData.get("widget_color_header_bg") ?? "");
  const colorHeaderTextRaw = String(
    formData.get("widget_color_header_text") ?? "",
  );
  const colorChatBgRaw = String(formData.get("widget_color_chat_bg") ?? "");
  const colorUserBubbleBgRaw = String(
    formData.get("widget_color_user_bubble_bg") ?? "",
  );
  const colorUserBubbleTextRaw = String(
    formData.get("widget_color_user_bubble_text") ?? "",
  );
  const colorBotBubbleBgRaw = String(
    formData.get("widget_color_bot_bubble_bg") ?? "",
  );
  const colorBotBubbleTextRaw = String(
    formData.get("widget_color_bot_bubble_text") ?? "",
  );
  const colorToggleBgRaw = String(formData.get("widget_color_toggle_bg") ?? "");
  const colorToggleTextRaw = String(
    formData.get("widget_color_toggle_text") ?? "",
  );
  const colorBubbleBgRaw = String(formData.get("widget_color_bubble_bg") ?? "");
  const colorBubbleTextRaw = String(
    formData.get("widget_color_bubble_text") ?? "",
  );
  const colorBubbleSubtextRaw = String(
    formData.get("widget_color_bubble_subtext") ?? "",
  );
  const colorBubbleBorderRaw = String(
    formData.get("widget_color_bubble_border") ?? "",
  );
  const colorBubbleGlowRaw = String(
    formData.get("widget_color_bubble_glow") ?? "",
  );
  const launcherIconRaw = String(formData.get("widget_launcher_icon") ?? "");
  const launcherLogoUrlRaw = String(
    formData.get("widget_launcher_logo_url") ?? "",
  );

  const { error } = await supabase
    .from("agents")
    .update({
      widget_accent: accentRaw.trim() ? sanitizeHex(accentRaw) : null,
      widget_brand: normalizeWidgetText(brandRaw, widgetLimits.brand),
      widget_label: normalizeWidgetText(labelRaw, widgetLimits.label),
      widget_greeting: normalizeWidgetText(greetingRaw, widgetLimits.greeting),
      widget_format: formatRaw.trim() ? sanitizeWidgetFormat(formatRaw) : null,
      widget_launcher_style: launcherStyleRaw.trim()
        ? sanitizeLauncherStyle(launcherStyleRaw)
        : null,
      widget_bubble_subtitle: normalizeWidgetText(
        bubbleSubtitleRaw,
        widgetLimits.bubbleSubtitle,
      ),
      widget_bubble_use_three: bubbleUseThreeRaw.trim()
        ? sanitizeWidgetBoolean(
            bubbleUseThreeRaw,
            widgetDefaults.bubbleUseThree,
          )
        : null,
      widget_bubble_width: bubbleWidthRaw.trim()
        ? sanitizeWidgetNumber(
            bubbleWidthRaw,
            widgetDefaults.bubbleWidth,
            widgetLimits.bubbleWidth.min,
            widgetLimits.bubbleWidth.max,
          )
        : null,
      widget_bubble_radius: bubbleRadiusRaw.trim()
        ? sanitizeWidgetNumber(
            bubbleRadiusRaw,
            widgetDefaults.bubbleRadius,
            widgetLimits.bubbleRadius.min,
            widgetLimits.bubbleRadius.max,
          )
        : null,
      widget_human_support_text: normalizeWidgetText(
        humanSupportRaw,
        widgetLimits.humanSupportText,
      ),
      widget_position: positionRaw.trim() ? sanitizePosition(positionRaw) : null,
      widget_width: widthRaw.trim()
        ? sanitizeWidgetNumber(
            widthRaw,
            widgetDefaults.width,
            widgetLimits.width.min,
            widgetLimits.width.max,
          )
        : null,
      widget_height: heightRaw.trim()
        ? sanitizeWidgetNumber(
            heightRaw,
            widgetDefaults.height,
            widgetLimits.height.min,
            widgetLimits.height.max,
          )
        : null,
      widget_offset_x: offsetXRaw.trim()
        ? sanitizeWidgetNumber(
            offsetXRaw,
            widgetDefaults.offsetX,
            widgetLimits.offsetX.min,
            widgetLimits.offsetX.max,
          )
        : null,
      widget_offset_y: offsetYRaw.trim()
        ? sanitizeWidgetNumber(
            offsetYRaw,
            widgetDefaults.offsetY,
            widgetLimits.offsetY.min,
            widgetLimits.offsetY.max,
          )
        : null,
      widget_launcher_size: launcherSizeRaw.trim()
        ? sanitizeWidgetNumber(
            launcherSizeRaw,
            widgetDefaults.launcherSize,
            widgetLimits.launcherSize.min,
            widgetLimits.launcherSize.max,
          )
        : null,
      widget_border_radius: borderRadiusRaw.trim()
        ? sanitizeWidgetNumber(
            borderRadiusRaw,
            widgetDefaults.borderRadius,
            widgetLimits.borderRadius.min,
            widgetLimits.borderRadius.max,
          )
        : null,
      widget_color_header_bg: colorHeaderBgRaw.trim()
        ? sanitizeHex(colorHeaderBgRaw)
        : null,
      widget_color_header_text: colorHeaderTextRaw.trim()
        ? sanitizeHex(colorHeaderTextRaw)
        : null,
      widget_color_chat_bg: colorChatBgRaw.trim()
        ? sanitizeHex(colorChatBgRaw)
        : null,
      widget_color_user_bubble_bg: colorUserBubbleBgRaw.trim()
        ? sanitizeHex(colorUserBubbleBgRaw)
        : null,
      widget_color_user_bubble_text: colorUserBubbleTextRaw.trim()
        ? sanitizeHex(colorUserBubbleTextRaw)
        : null,
      widget_color_bot_bubble_bg: colorBotBubbleBgRaw.trim()
        ? sanitizeHex(colorBotBubbleBgRaw)
        : null,
      widget_color_bot_bubble_text: colorBotBubbleTextRaw.trim()
        ? sanitizeHex(colorBotBubbleTextRaw)
        : null,
      widget_color_toggle_bg: colorToggleBgRaw.trim()
        ? sanitizeHex(colorToggleBgRaw)
        : null,
      widget_color_toggle_text: colorToggleTextRaw.trim()
        ? sanitizeHex(colorToggleTextRaw)
        : null,
      widget_color_bubble_bg: colorBubbleBgRaw.trim()
        ? sanitizeHex(colorBubbleBgRaw)
        : null,
      widget_color_bubble_text: colorBubbleTextRaw.trim()
        ? sanitizeHex(colorBubbleTextRaw)
        : null,
      widget_color_bubble_subtext: colorBubbleSubtextRaw.trim()
        ? sanitizeHex(colorBubbleSubtextRaw)
        : null,
      widget_color_bubble_border: colorBubbleBorderRaw.trim()
        ? sanitizeHex(colorBubbleBorderRaw)
        : null,
      widget_color_bubble_glow: colorBubbleGlowRaw.trim()
        ? sanitizeHex(colorBubbleGlowRaw)
        : null,
      widget_launcher_icon: launcherIconRaw.trim()
        ? sanitizeLauncherIcon(launcherIconRaw)
        : null,
      widget_launcher_logo_url: normalizeWidgetUrl(
        launcherLogoUrlRaw,
        widgetLimits.launcherLogoUrl,
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId)
    .eq("user_id", user.id);

  if (error) redirect(`/dashboard/agents/${agentId}/widget?error=save`);
  redirect(`/dashboard/agents/${agentId}/widget?saved=1`);
}

export default async function AgentWidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, user } = await requireUser();
  let { data: agent, error } = await supabase
    .from("agents")
    .select(WIDGET_AGENT_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (isMissingSelectedWidgetColumn(error)) {
    const maybeError = error as { message?: string; details?: string } | null;
    const text = `${maybeError?.message ?? ""} ${maybeError?.details ?? ""}`;
    console.warn(
      "[AI SaaS] a widget customization column is missing; using legacy widget select.",
    );
    const fallback = text.includes("widget_format")
      ? await supabase
          .from("agents")
          .select(WIDGET_AGENT_SELECT_MINIMAL)
          .eq("id", id)
          .eq("user_id", user.id)
          .single()
      : await supabase
          .from("agents")
          .select(WIDGET_AGENT_SELECT_LEGACY)
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
    agent = fallback.data
      ? {
          ...fallback.data,
          widget_format: "widget_format" in fallback.data ? fallback.data.widget_format : null,
          widget_launcher_style: null,
          widget_bubble_subtitle: null,
          widget_bubble_use_three: null,
          widget_bubble_width: null,
          widget_bubble_radius: null,
          widget_color_bubble_bg: null,
          widget_color_bubble_text: null,
          widget_color_bubble_subtext: null,
          widget_color_bubble_border: null,
          widget_color_bubble_glow: null,
        }
      : null;
    error = fallback.error;
  }

  if (error || !agent) return notFound();

  const headersList = await headers();
  const siteUrl = getSiteUrlFromHeaders(headersList);
  const widgetPositionValue =
    agent.widget_position === "left" || agent.widget_position === "right"
      ? agent.widget_position
      : null;

  return (
    <form action={updateWidget} className="space-y-6">
      <input type="hidden" name="agent_id" value={agent.id} />
      <header className="ui-card--strong p-6">
        <p className="ui-badge">Widget</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {agent.name} widget
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Customize colors, copy, position, and preview before publishing.
            </p>
          </div>
          <div className="flex gap-3">
            <SubmitButton label="Save widget" />
            <Link
              href={`/dashboard/agents/${agent.id}`}
              className="ui-button ui-button--ghost"
            >
              Back to setup
            </Link>
          </div>
        </div>
      </header>

      {query.saved === "1" ? (
        <div className="ui-alert ui-alert--success">Widget saved.</div>
      ) : null}
      {query.error ? (
        <div className="ui-alert ui-alert--error">
          We could not save the widget. Please try again.
        </div>
      ) : null}

      <article className="ui-card glass-pane p-2">
        <WidgetDesigner
          apiKey={agent.api_key}
          siteUrl={siteUrl}
          initialAccent={agent.widget_accent}
          initialBrand={agent.widget_brand}
          initialLabel={agent.widget_label}
          initialGreeting={agent.widget_greeting}
          initialLanguage={agent.language ?? "auto"}
          initialHumanSupportText={agent.widget_human_support_text}
          initialFormat={agent.widget_format}
          initialPosition={widgetPositionValue}
          initialLauncherStyle={agent.widget_launcher_style}
          initialBubbleSubtitle={agent.widget_bubble_subtitle}
          initialBubbleUseThree={agent.widget_bubble_use_three}
          initialBubbleWidth={agent.widget_bubble_width}
          initialBubbleRadius={agent.widget_bubble_radius}
          initialWidth={agent.widget_width}
          initialHeight={agent.widget_height}
          initialOffsetX={agent.widget_offset_x}
          initialOffsetY={agent.widget_offset_y}
          initialLauncherSize={agent.widget_launcher_size}
          initialBorderRadius={agent.widget_border_radius}
          initialColorHeaderBg={agent.widget_color_header_bg}
          initialColorHeaderText={agent.widget_color_header_text}
          initialColorChatBg={agent.widget_color_chat_bg}
          initialColorUserBubbleBg={agent.widget_color_user_bubble_bg}
          initialColorUserBubbleText={agent.widget_color_user_bubble_text}
          initialColorBotBubbleBg={agent.widget_color_bot_bubble_bg}
          initialColorBotBubbleText={agent.widget_color_bot_bubble_text}
          initialColorToggleBg={agent.widget_color_toggle_bg}
          initialColorToggleText={agent.widget_color_toggle_text}
          initialColorBubbleBg={agent.widget_color_bubble_bg}
          initialColorBubbleText={agent.widget_color_bubble_text}
          initialColorBubbleSubtext={agent.widget_color_bubble_subtext}
          initialColorBubbleBorder={agent.widget_color_bubble_border}
          initialColorBubbleGlow={agent.widget_color_bubble_glow}
          initialLauncherIcon={agent.widget_launcher_icon}
          initialLauncherLogoUrl={agent.widget_launcher_logo_url}
        />
      </article>
    </form>
  );
}
