import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  MessageSquare,
  Palette,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";
import SubmitButton from "@/components/SubmitButton";
import AgentSimulator from "./AgentSimulator";
import KnowledgeSection from "./KnowledgeSection";

import {
  widgetLimits,
  sanitizeHex,
  sanitizeLauncherIcon,
  sanitizePosition,
} from "@/lib/widget/defaults";

const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Automatic detection" },
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
];

// --- Utilities -------------------------------------------------------------
function toHostname(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;

  try {
    const hasScheme = /^https?:\/\//i.test(value);
    const url = new URL(hasScheme ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    if (/^[a-z0-9.-]+$/i.test(value)) {
      return value.replace(/^www\./, "");
    }
    return null;
  }
}

function normalizeDomainList(input: string): string[] {
  const unique = new Set<string>();
  for (const part of input.split(",")) {
    const host = toHostname(part || "");
    if (host) unique.add(host);
  }
  return Array.from(unique).slice(0, 50);
}

function normalizeWidgetText(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

const AGENTS_BASE = "/dashboard/agents";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-300">
        {description}
      </p>
    </div>
  );
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

function StatusRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-right font-medium text-slate-200">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            good ? "bg-emerald-400" : "bg-amber-300"
          }`}
        />
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}

function ChecklistItem({
  done,
  title,
  detail,
}: {
  done: boolean;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-slate-800/70 p-3">
      <span
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          done
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
            : "border-slate-700  text-slate-500"
        }`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-400">
          {detail}
        </span>
      </span>
    </li>
  );
}

// --- Server action ---------------------------------------------------------
async function updateAgentAndWidget(formData: FormData) {
  "use server";

  const { supabase, user } = await requireUser();

  const agentId = String(formData.get("agent_id") ?? "");
  if (!agentId) redirect(AGENTS_BASE);

  const wooIntegrationRaw = String(formData.get("woo_integration_id") ?? "");
  const shopifyIntegrationRaw = String(
    formData.get("shopify_integration_id") ?? "",
  );
  const domainsRaw = String(formData.get("allowed_domains") ?? "");
  const promptSystemRaw = String(formData.get("prompt_system") ?? "");
  const languageRaw = String(formData.get("language") ?? "");
  const fallbackUrlRaw = String(formData.get("fallback_url") ?? "").trim();

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
  const launcherIconRaw = String(formData.get("widget_launcher_icon") ?? "");
  const launcherLogoUrlRaw = String(
    formData.get("widget_launcher_logo_url") ?? "",
  );

  const allowedDomains = normalizeDomainList(domainsRaw);
  const wooIntegrationId =
    wooIntegrationRaw && wooIntegrationRaw !== "none"
      ? wooIntegrationRaw
      : null;
  const shopifyIntegrationId =
    shopifyIntegrationRaw && shopifyIntegrationRaw !== "none"
      ? shopifyIntegrationRaw
      : null;
  const promptSystem = promptSystemRaw.trim() || null;
  const language =
    languageRaw && languageRaw !== "auto" ? languageRaw.trim() : null;

  let fallbackUrl: string | null = null;
  if (fallbackUrlRaw) {
    try {
      const url = new URL(
        fallbackUrlRaw,
        fallbackUrlRaw.startsWith("http")
          ? undefined
          : "https://placeholder.local",
      );
      fallbackUrl =
        url.origin === "https://placeholder.local"
          ? `${url.pathname}${url.search}${url.hash}`
          : url.toString();
    } catch {
      fallbackUrl = fallbackUrlRaw;
    }
  }

  if (wooIntegrationId) {
    const { data: integration, error } = await supabase
      .from("integrations_woocommerce")
      .select("id, user_id, is_active")
      .eq("id", wooIntegrationId)
      .single();

    if (error || !integration || integration.user_id !== user.id) {
      redirect(`${AGENTS_BASE}/${agentId}?error=integration`);
    }
    if (integration && integration.is_active === false) {
      redirect(`${AGENTS_BASE}/${agentId}?error=integration_inactive`);
    }
  }

  if (shopifyIntegrationId) {
    const { data: integration, error } = await supabase
      .from("integrations_shopify")
      .select("id, user_id, is_active")
      .eq("id", shopifyIntegrationId)
      .single();

    if (error || !integration || integration.user_id !== user.id) {
      redirect(`${AGENTS_BASE}/${agentId}?error=integration`);
    }
    if (integration && integration.is_active === false) {
      redirect(`${AGENTS_BASE}/${agentId}?error=integration_inactive`);
    }
  }

  const { error: updateError } = await supabase
    .from("agents")
    .update({
      woo_integration_id: wooIntegrationId,
      shopify_integration_id: shopifyIntegrationId,
      allowed_domains: allowedDomains.length ? allowedDomains : null,
      prompt_system: promptSystem,
      language,
      fallback_url: fallbackUrl,
      ...(formData.has("widget_accent")
        ? { widget_accent: accentRaw.trim() ? sanitizeHex(accentRaw) : null }
        : {}),
      ...(formData.has("widget_brand")
        ? { widget_brand: normalizeWidgetText(brandRaw, widgetLimits.brand) }
        : {}),
      ...(formData.has("widget_label")
        ? { widget_label: normalizeWidgetText(labelRaw, widgetLimits.label) }
        : {}),
      ...(formData.has("widget_greeting")
        ? {
            widget_greeting: normalizeWidgetText(
              greetingRaw,
              widgetLimits.greeting,
            ),
          }
        : {}),
      ...(formData.has("widget_human_support_text")
        ? {
            widget_human_support_text: normalizeWidgetText(
              humanSupportRaw,
              widgetLimits.humanSupportText,
            ),
          }
        : {}),
      ...(formData.has("widget_position")
        ? {
            widget_position: positionRaw.trim()
              ? sanitizePosition(positionRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_header_bg")
        ? {
            widget_color_header_bg: colorHeaderBgRaw.trim()
              ? sanitizeHex(colorHeaderBgRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_header_text")
        ? {
            widget_color_header_text: colorHeaderTextRaw.trim()
              ? sanitizeHex(colorHeaderTextRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_chat_bg")
        ? {
            widget_color_chat_bg: colorChatBgRaw.trim()
              ? sanitizeHex(colorChatBgRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_user_bubble_bg")
        ? {
            widget_color_user_bubble_bg: colorUserBubbleBgRaw.trim()
              ? sanitizeHex(colorUserBubbleBgRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_user_bubble_text")
        ? {
            widget_color_user_bubble_text: colorUserBubbleTextRaw.trim()
              ? sanitizeHex(colorUserBubbleTextRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_bot_bubble_bg")
        ? {
            widget_color_bot_bubble_bg: colorBotBubbleBgRaw.trim()
              ? sanitizeHex(colorBotBubbleBgRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_bot_bubble_text")
        ? {
            widget_color_bot_bubble_text: colorBotBubbleTextRaw.trim()
              ? sanitizeHex(colorBotBubbleTextRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_toggle_bg")
        ? {
            widget_color_toggle_bg: colorToggleBgRaw.trim()
              ? sanitizeHex(colorToggleBgRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_color_toggle_text")
        ? {
            widget_color_toggle_text: colorToggleTextRaw.trim()
              ? sanitizeHex(colorToggleTextRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_launcher_icon")
        ? {
            widget_launcher_icon: launcherIconRaw.trim()
              ? sanitizeLauncherIcon(launcherIconRaw)
              : null,
          }
        : {}),
      ...(formData.has("widget_launcher_logo_url")
        ? {
            widget_launcher_logo_url: normalizeWidgetUrl(
              launcherLogoUrlRaw,
              widgetLimits.launcherLogoUrl,
            ),
          }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId)
    .eq("user_id", user.id);

  if (updateError) {
    redirect(`${AGENTS_BASE}/${agentId}?error=save_all`);
  }

  redirect(`${AGENTS_BASE}/${agentId}?saved=1`);
}

type AgentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AgentDetailPage({
  params,
  searchParams,
}: AgentDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const { supabase, user } = await requireUser();

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select(
      "id, user_id, name, api_key, woo_integration_id, shopify_integration_id, allowed_domains, messages_limit, is_active, created_at, prompt_system, language, fallback_url, description, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_launcher_icon, widget_launcher_logo_url, widget_position, widget_width, widget_height, widget_offset_x, widget_offset_y, widget_launcher_size, widget_border_radius, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (agentError || !agent) return notFound();

  const { data: wooIntegrations } = await supabase
    .from("integrations_woocommerce")
    .select(
      "id, label, store_url, is_active, created_at, last_sync_status, products_indexed_count",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: shopifyIntegrations } = await supabase
    .from("integrations_shopify")
    .select(
      "id, label, shop_domain, is_active, created_at, last_sync_status, products_indexed_count",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const saved = resolvedSearchParams.saved === "1";
  const errorParam = resolvedSearchParams.error;
  const errorKey = typeof errorParam === "string" ? errorParam : null;

  const errorMessages: Record<string, string> = {
    integration: "The selected integration does not belong to your account.",
    integration_inactive: "The selected integration is inactive.",
    save_all: "We could not save your changes. Please try again.",
  };

  const statusLabel = agent.is_active ? "Active" : "Paused";
  const allowedDomains = agent.allowed_domains ?? [];
  const promptSystemValue = agent.prompt_system ?? "";
  const languageValue = agent.language ?? "auto";
  const fallbackUrlValue = agent.fallback_url ?? "";
  const descriptionFallback = agent.description ?? "";

  const createdAt = agent.created_at
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(agent.created_at))
    : "Unknown date";

  const selectedWooIntegration = (wooIntegrations ?? []).find(
    (integration) => integration.id === agent.woo_integration_id,
  );
  const selectedShopifyIntegration = (shopifyIntegrations ?? []).find(
    (integration) => integration.id === agent.shopify_integration_id,
  );
  const selectedIntegration =
    selectedWooIntegration ?? selectedShopifyIntegration ?? null;
  const selectedIntegrationName = selectedWooIntegration
    ? selectedWooIntegration.label?.trim() || selectedWooIntegration.store_url
    : selectedShopifyIntegration
      ? selectedShopifyIntegration.label?.trim() ||
        selectedShopifyIntegration.shop_domain
      : "No catalog connected";
  const selectedIntegrationActive = selectedIntegration?.is_active ?? false;
  const indexedProducts = selectedIntegration?.products_indexed_count ?? 0;
  const hasCatalog = Boolean(selectedIntegration);
  const hasPrompt = Boolean(promptSystemValue.trim());
  const hasDomains = allowedDomains.length > 0;
  const hasWidgetCopy = Boolean(
    agent.widget_brand?.trim() ||
      agent.widget_label?.trim() ||
      agent.widget_greeting?.trim() ||
      agent.widget_human_support_text?.trim(),
  );
  const hasWidgetColors = Boolean(
    agent.widget_accent?.trim() ||
      agent.widget_color_header_bg?.trim() ||
      agent.widget_color_header_text?.trim() ||
      agent.widget_color_chat_bg?.trim() ||
      agent.widget_color_user_bubble_bg?.trim() ||
      agent.widget_color_user_bubble_text?.trim() ||
      agent.widget_color_bot_bubble_bg?.trim() ||
      agent.widget_color_bot_bubble_text?.trim() ||
      agent.widget_color_toggle_bg?.trim() ||
      agent.widget_color_toggle_text?.trim() ||
      agent.widget_launcher_icon?.trim() ||
      agent.widget_launcher_logo_url?.trim() ||
      agent.widget_width ||
      agent.widget_height ||
      agent.widget_offset_x ||
      agent.widget_offset_y ||
      agent.widget_launcher_size ||
      agent.widget_border_radius,
  );
  const completionItems = [
    agent.is_active,
    hasCatalog && selectedIntegrationActive,
    hasDomains,
    hasPrompt,
    hasWidgetCopy,
  ];
  const completionCount = completionItems.filter(Boolean).length;
  const completionPercent = Math.round(
    (completionCount / completionItems.length) * 100,
  );
  const nextStep = !agent.is_active
    ? "Activate this agent"
    : !hasCatalog
      ? "Connect a catalog"
      : !hasDomains
        ? "Add allowed domains"
        : !hasPrompt
          ? "Add agent instructions"
          : !hasWidgetCopy
            ? "Customize widget copy"
            : "Install the widget";

  return (
    <main className="min-h-screen text-slate-100">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={AGENTS_BASE}
                className="ui-button ui-button--subtle h-10 w-10 p-0"
                aria-label="Back to agents"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold text-white sm:text-3xl">
                    {agent.name}
                  </h1>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                    <span
                      className={`dot ${
                        agent.is_active ? "dot--active" : "dot--paused"
                      }`}
                    />
                    {statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Use the left sidebar to move between setup, widget design,
                  knowledge, simulator, and install.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`${AGENTS_BASE}/${agent.id}/widget`}
              className="ui-button ui-button--secondary"
            >
              Edit widget
            </Link>
            <Link
              href={`${AGENTS_BASE}/${agent.id}/install`}
              className="ui-button ui-button--primary"
            >
              Publish
            </Link>
          </div>
        </header>

        {saved ? (
          <div className="ui-alert ui-alert--success">
            Changes saved successfully.
          </div>
        ) : null}
        {errorKey ? (
          <div className="ui-alert ui-alert--error">
            {errorMessages[errorKey] ?? "An unexpected error occurred."}
          </div>
        ) : null}

        <div className="grid flex-1 items-start gap-5 2xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4 2xl:sticky 2xl:top-24">
            <article className="rounded-3xl border border-border bg-surface/45 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    I opened a widget draft in the canvas.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Edit the copy, colors, behavior, catalog, knowledge, and
                    publish checklist without leaving this conversation.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <StatusRow
                  label="Catalog"
                  value={selectedIntegrationName}
                  good={hasCatalog && selectedIntegrationActive}
                />
                <StatusRow
                  label="Domains"
                  value={hasDomains ? `${allowedDomains.length} allowed` : "Open"}
                  good={hasDomains}
                />
                <StatusRow
                  label="Messages"
                  value={agent.messages_limit?.toLocaleString("en-US") ?? "Not set"}
                  good={Boolean(agent.messages_limit)}
                />
                <StatusRow label="Created" value={createdAt} good />
              </div>
            </article>

            <nav
              aria-label="Agent editor sections"
              className="rounded-3xl border border-border bg-surface/35 p-3"
            >
              <div className="px-2 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  Editor
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Widget design now lives in its own focused screen.
                </p>
              </div>

              <div className="space-y-2">
                <SidebarLink
                  href={`${AGENTS_BASE}/${agent.id}`}
                  icon={Brain}
                  label="Agent setup"
                  description="Rules, integrations, domains, and escalation."
                  active
                />
                <SidebarLink
                  href={`${AGENTS_BASE}/${agent.id}/widget`}
                  icon={Palette}
                  label="Widget editor"
                  description={
                    hasWidgetCopy || hasWidgetColors
                      ? "Copy or colors have custom settings."
                      : "Customize copy, colors, position, and preview."
                  }
                />
                <SidebarLink
                  href={`${AGENTS_BASE}/${agent.id}/analytics`}
                  icon={BarChart3}
                  label="Analytics"
                  description="Traffic, opens, interactions, and words."
                />
                <SidebarLink
                  href={`${AGENTS_BASE}/${agent.id}/knowledge`}
                  icon={BookOpen}
                  label="Knowledge"
                  description="Upload product and support context."
                />
                <SidebarLink
                  href={`${AGENTS_BASE}/${agent.id}/simulator`}
                  icon={MessageSquare}
                  label="Simulator"
                  description="Test replies before publishing."
                />
                <SidebarLink
                  href={`${AGENTS_BASE}/${agent.id}/install`}
                  icon={Rocket}
                  label="Install"
                  description="Copy the production snippet."
                />
              </div>
            </nav>

            <AgentSimulator agentId={agent.id} />
          </aside>

          <form
            action={updateAgentAndWidget}
            className="min-w-0 rounded-3xl border border-border bg-background/55 shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
          >
            <input type="hidden" name="agent_id" value={agent.id} />

            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-3xl border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Setup
                </p>
                <h2 className="truncate text-lg font-semibold text-white">
                  Agent editor
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-slate-300">
                  {completionPercent}% ready
                </span>
                <SubmitButton label="Save canvas" />
              </div>
            </div>

            <div className="max-h-none space-y-5 overflow-visible p-4 sm:p-5 2xl:max-h-[calc(100dvh-10rem)] 2xl:overflow-y-auto">
              <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      Workspace
                    </p>
                    <p className="mt-1 text-sm text-emerald-50">
                      Configure the assistant here. Open the widget editor from
                      the left sidebar when you want to tune the customer-facing
                      launcher and preview.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-emerald-100/75">
                      Next: {nextStep}
                    </p>
                    <Link
                      href={`${AGENTS_BASE}/${agent.id}/widget`}
                      className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/20"
                    >
                      Edit widget
                    </Link>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800/80 p-5">
                <SectionHeading
                  eyebrow="Behavior"
                  title="Assistant rules"
                  description="Tune the core instructions next to the widget draft."
                />
              <div className="mt-5 space-y-5">
                <div className="space-y-2" data-oid="1:fz-w-">
                  <label
                    htmlFor="woo-integration"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="3pgz8dj"
                  >
                    WooCommerce integration
                  </label>
                  <select
                    id="woo-integration"
                    name="woo_integration_id"
                    defaultValue={agent.woo_integration_id || "none"}
                    className="ui-input"
                    data-oid="xwo.-f7"
                  >
                    <option value="none" data-oid="0v5v70x">
                      No integration
                    </option>
                    {(wooIntegrations ?? []).map((integration) => {
                      const label =
                        integration.label?.trim() || integration.store_url;
                      const indexedCount =
                        integration.products_indexed_count ?? 0;
                      const syncLabel =
                        integration.last_sync_status === "success" &&
                        indexedCount > 0
                          ? `indexed ${indexedCount}`
                          : "not indexed";
                      return (
                        <option
                          key={integration.id}
                          value={integration.id}
                          data-oid="pkj188g"
                        >
                          {label} - {syncLabel}{" "}
                          {integration.is_active ? "" : "(inactive)"}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-500" data-oid="ec9k2tu">
                    Manage your WooCommerce credentials from{" "}
                    <Link
                      href="/integrations/woo"
                      className="text-emerald-300 hover:text-emerald-200"
                      data-oid="7.y9isq"
                    >
                      Integrations
                    </Link>
                    .
                  </p>
                </div>

                <div className="space-y-2" data-oid="-ej-3kp">
                  <label
                    htmlFor="shopify-integration"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="dm1pc3c"
                  >
                    Shopify integration
                  </label>
                  <select
                    id="shopify-integration"
                    name="shopify_integration_id"
                    defaultValue={agent.shopify_integration_id || "none"}
                    className="ui-input"
                    data-oid=":.mz4qy"
                  >
                    <option value="none" data-oid="b_zx3c_">
                      No integration
                    </option>
                    {(shopifyIntegrations ?? []).map((integration) => {
                      const label =
                        integration.label?.trim() || integration.shop_domain;
                      const indexedCount =
                        integration.products_indexed_count ?? 0;
                      const syncLabel =
                        integration.last_sync_status === "success" &&
                        indexedCount > 0
                          ? `indexed ${indexedCount}`
                          : "not indexed";
                      return (
                        <option
                          key={integration.id}
                          value={integration.id}
                          data-oid="6paed6w"
                        >
                          {label} - {syncLabel}{" "}
                          {integration.is_active ? "" : "(inactive)"}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-500" data-oid="ww_uvw9">
                    Manage your Shopify credentials from{" "}
                    <Link
                      href="/integrations/shopify"
                      className="text-emerald-300 hover:text-emerald-200"
                      data-oid="ce3adea"
                    >
                      Integrations
                    </Link>
                    .
                  </p>
                </div>

                <div className="space-y-2" data-oid="5ad85fa">
                  <label
                    htmlFor="prompt-system"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="ons7xg4"
                  >
                    Agent instructions (prompt)
                  </label>
                  <textarea
                    id="prompt-system"
                    name="prompt_system"
                    defaultValue={promptSystemValue}
                    placeholder={
                      descriptionFallback ||
                      "Describe tone, policies, and objectives for the agent."
                    }
                    rows={5}
                    className="ui-input"
                    data-oid="uof1i.u"
                  />

                  <p className="text-xs text-slate-500" data-oid=".msit-m">
                    This text is sent as the system prompt to the model. Use
                    variables, the desired tone, and brand guardrails.
                  </p>
                </div>

                <div className="space-y-2" data-oid="jrflppd">
                  <label
                    htmlFor="language"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="yjzbpy_"
                  >
                    Preferred response language
                  </label>
                  <select
                    id="language"
                    name="language"
                    defaultValue={languageValue}
                    className="ui-input"
                    data-oid="rugrt2_"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        data-oid="m-avm:b"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500" data-oid="0q.y24n">
                    With automatic detection, the model adapts the response to
                    the customer&apos;s language.
                  </p>
                </div>

                <div className="space-y-2" data-oid=".cijqtn">
                  <label
                    htmlFor="fallback-url"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="an8t:z9"
                  >
                    Fallback URL (optional)
                  </label>
                  <input
                    id="fallback-url"
                    name="fallback_url"
                    type="url"
                    inputMode="url"
                    defaultValue={fallbackUrlValue}
                    placeholder="https://wa.me/34693536768"
                    className="ui-input"
                    data-oid="c-aq-hb"
                  />

                  <p className="text-xs text-slate-500" data-oid="2nyqjet">
                    Use a contact page, WhatsApp link, or Telegram link for
                    human escalation.
                  </p>
                </div>

                <div className="space-y-2" data-oid="_ix9:2o">
                  <label
                    htmlFor="allowed-domains"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="ds0xspz"
                  >
                    Allowed domains (optional)
                  </label>
                  <input
                    id="allowed-domains"
                    name="allowed_domains"
                    placeholder="myshop.com, store.com"
                    defaultValue={allowedDomains.join(", ")}
                    className="ui-input"
                    data-oid="7mads1i"
                  />

                  <p className="text-xs text-slate-500" data-oid="vmqk_:.">
                    Separate each domain with commas. If left empty, the widget
                    can load from any origin.
                  </p>
                  {!!allowedDomains.length && (
                    <p className="text-xs text-slate-400" data-oid="c8jvf_7">
                      Current domains:{" "}
                      <span
                        className="font-mono text-emerald-200"
                        data-oid="s7mgxhf"
                      >
                        {allowedDomains.join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              </section>

              <KnowledgeSection agentId={agent.id} />

              <article className="rounded-2xl border border-slate-800/80 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Publication checklist
                    </h2>
                    <p className="text-xs text-slate-400">
                      {completionCount} of {completionItems.length} complete
                    </p>
                  </div>
                </div>
                <ol className="mt-4 space-y-2">
                  <ChecklistItem
                    done={agent.is_active}
                    title="Agent active"
                    detail={
                      agent.is_active
                        ? "This agent can respond to widget requests."
                        : "Activate it before installing on a live store."
                    }
                  />
                  <ChecklistItem
                    done={hasCatalog && selectedIntegrationActive}
                    title="Catalog connected"
                    detail={
                      hasCatalog
                        ? selectedIntegrationActive
                          ? `${indexedProducts.toLocaleString("en-US")} products available.`
                          : "Selected integration is inactive."
                        : "Select WooCommerce or Shopify."
                    }
                  />
                  <ChecklistItem
                    done={hasDomains}
                    title="Domains allowed"
                    detail={
                      hasDomains
                        ? `${allowedDomains.length} domain${allowedDomains.length === 1 ? "" : "s"} configured.`
                        : "Add the production storefront domain."
                    }
                  />
                  <ChecklistItem
                    done={hasPrompt}
                    title="Instructions set"
                    detail={
                      hasPrompt
                        ? "Tone and policy guidance are configured."
                        : "Add support rules and brand tone."
                    }
                  />
                  <ChecklistItem
                    done={hasWidgetCopy}
                    title="Widget customized"
                    detail={
                      hasWidgetCopy
                        ? "Visible widget text has been adjusted."
                        : "Tune greeting, label, and subtitle."
                    }
                  />
                </ol>
              </article>

              <article
                className="rounded-2xl border border-slate-800/80 p-5 text-sm text-slate-300"
                data-oid="n.i41pq"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-200">
                    <Bot className="h-4 w-4" />
                  </span>
                  <h3
                    className="text-lg font-semibold text-white"
                    data-oid="qdyz.rq"
                  >
                    Operating notes
                  </h3>
                </div>
                <div className="mt-4 grid gap-3 text-xs text-slate-400">
                  <p className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                    One agent per store or language keeps catalog answers and
                    tone more predictable.
                  </p>
                  <p className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                    Rotate the install key by creating a new agent if access is
                    ever exposed.
                  </p>
                  <p className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                    Watch message limits before seasonal campaigns or product
                    launches.
                  </p>
                </div>
              </article>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  description,
  active = false,
}: {
  href: string;
  icon: typeof Palette;
  label: string;
  description: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex gap-3 rounded-2xl border p-3 transition ${
        active
          ? "border-emerald-400/35 bg-emerald-400/10 text-white"
          : "border-slate-800/80 bg-slate-950/30 text-slate-300 hover:border-emerald-400/35 hover:bg-slate-950/55 hover:text-white"
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
          active
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            : "border-slate-700 bg-slate-900/60 text-slate-400 group-hover:text-emerald-200"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-400">
          {description}
        </span>
      </span>
    </Link>
  );
}
