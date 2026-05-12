import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth/requireUser";
import { getSiteUrlFromHeaders } from "@/lib/site";
import {
  sanitizeHex,
  sanitizePosition,
  widgetLimits,
} from "@/lib/widget/defaults";
import WidgetDesigner from "../WidgetDesigner";

function normalizeWidgetText(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
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
  const positionRaw = String(formData.get("widget_position") ?? "");
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

  const { error } = await supabase
    .from("agents")
    .update({
      widget_accent: accentRaw.trim() ? sanitizeHex(accentRaw) : null,
      widget_brand: normalizeWidgetText(brandRaw, widgetLimits.brand),
      widget_label: normalizeWidgetText(labelRaw, widgetLimits.label),
      widget_greeting: normalizeWidgetText(greetingRaw, widgetLimits.greeting),
      widget_human_support_text: normalizeWidgetText(
        humanSupportRaw,
        widgetLimits.humanSupportText,
      ),
      widget_position: positionRaw.trim() ? sanitizePosition(positionRaw) : null,
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
  const { data: agent, error } = await supabase
    .from("agents")
    .select(
      "id, name, api_key, language, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_position, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

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
          initialPosition={widgetPositionValue}
          initialColorHeaderBg={agent.widget_color_header_bg}
          initialColorHeaderText={agent.widget_color_header_text}
          initialColorChatBg={agent.widget_color_chat_bg}
          initialColorUserBubbleBg={agent.widget_color_user_bubble_bg}
          initialColorUserBubbleText={agent.widget_color_user_bubble_text}
          initialColorBotBubbleBg={agent.widget_color_bot_bubble_bg}
          initialColorBotBubbleText={agent.widget_color_bot_bubble_text}
          initialColorToggleBg={agent.widget_color_toggle_bg}
          initialColorToggleText={agent.widget_color_toggle_text}
        />
      </article>
    </form>
  );
}
