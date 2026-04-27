import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Globe2,
  KeyRound,
  MessageSquare,
  PlugZap,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";
import { getSiteUrlFromHeaders } from "@/lib/site";
import WidgetDesigner from "./WidgetDesigner";
import EmbedSnippet from "./EmbedSnippet";
import SubmitButton from "@/components/SubmitButton";
import KnowledgeSection from "./KnowledgeSection";

import {
  widgetLimits,
  sanitizeHex,
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

// Centralized route base to avoid future hardcoded path issues
const AGENTS_BASE = "/dashboard/agents";

type StatusTone = "good" | "warn" | "muted";

function toneClasses(tone: StatusTone) {
  if (tone === "good") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (tone === "warn") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
  return "border-slate-700/70 bg-slate-900/50 text-slate-300";
}

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

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "muted",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
}) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 truncate text-lg font-semibold text-white">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClasses(
            tone,
          )}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
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
    <li className="flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/35 p-3">
      <span
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          done
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
            : "border-slate-700 bg-slate-900/60 text-slate-500"
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
      widget_accent: accentRaw.trim() ? sanitizeHex(accentRaw) : null,
      widget_brand: normalizeWidgetText(brandRaw, widgetLimits.brand),
      widget_label: normalizeWidgetText(labelRaw, widgetLimits.label),
      widget_greeting: normalizeWidgetText(greetingRaw, widgetLimits.greeting),
      widget_human_support_text: normalizeWidgetText(
        humanSupportRaw,
        widgetLimits.humanSupportText,
      ),
      widget_position: positionRaw.trim()
        ? sanitizePosition(positionRaw)
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
      "id, user_id, name, api_key, woo_integration_id, shopify_integration_id, allowed_domains, messages_limit, is_active, created_at, prompt_system, language, fallback_url, description, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_position, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text",
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

  const widgetPositionValue =
    agent.widget_position === "left" || agent.widget_position === "right"
      ? agent.widget_position
      : null;
  const headersList = await headers();
  const siteUrl = getSiteUrlFromHeaders(headersList);

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
    <main
      className="relative min-h-screen overflow-hidden text-slate-100"
      data-oid="9z-ztr5"
    >
      <div
        className="pointer-events-none absolute inset-0"
        data-oid="mbzx0jj"
      />

      <section
        className="relative z-10 mx-auto flex min-h-screen flex-col"
        data-oid="zpn9_yd"
      >
        <header
          className="ui-card--strong relative overflow-hidden p-6 sm:p-8"
          data-oid="r.1rhe:"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.14),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.12),transparent_32%)]" />
          <div
            className="relative flex flex-wrap items-start justify-between gap-6"
            data-oid=".wh4hdg"
          >
            <div className="min-w-0 space-y-4" data-oid="jzx-z02">
              <p className="ui-badge" data-oid="h3259kg">
                Agent command center
              </p>
              <div
                className="flex flex-wrap items-center gap-3"
                data-oid="73ouqi_"
              >
                <h1
                  className="text-3xl font-semibold leading-tight sm:text-5xl"
                  data-oid="1.pma0j"
                >
                  {agent.name}
                </h1>
                <span
                  className="ui-badge border-slate-700 text-slate-300 bg-transparent"
                  data-oid="r6at1a."
                >
                  <span
                    className={`dot ${
                      agent.is_active ? "dot--active" : "dot--paused"
                    }`}
                    data-oid="ogvvkd:"
                  />

                  {statusLabel}
                </span>
              </div>
              <p
                className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base"
                data-oid="sjx7ds9"
              >
                Configure the agent, connect catalog data, tune the widget, and
                copy the install script from one focused workspace.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                <a
                  href="#setup"
                  className="rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  Setup
                </a>
                <a
                  href="#knowledge"
                  className="rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  Knowledge
                </a>
                <a
                  href="#widget"
                  className="rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  Widget
                </a>
                <a
                  href="#install"
                  className="rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  Install
                </a>
              </div>
            </div>
            <Link
              href={AGENTS_BASE}
              className="ui-button ui-button--ghost"
              data-oid="hrr377v"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to agents
            </Link>
          </div>

          <div
            className="relative mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
            data-oid="1m33wnc"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={PlugZap}
                label="Catalog"
                value={selectedIntegrationName}
                detail={
                  hasCatalog
                    ? `${indexedProducts.toLocaleString("en-US")} products indexed`
                    : "Connect WooCommerce or Shopify to answer with catalog context."
                }
                tone={
                  hasCatalog && selectedIntegrationActive
                    ? "good"
                    : hasCatalog
                      ? "warn"
                      : "muted"
                }
              />
              <MetricCard
                icon={Globe2}
                label="Domains"
                value={hasDomains ? `${allowedDomains.length} allowed` : "Open"}
                detail={
                  hasDomains
                    ? allowedDomains.slice(0, 2).join(", ")
                    : "Add production domains before publishing."
                }
                tone={hasDomains ? "good" : "warn"}
              />
              <MetricCard
                icon={MessageSquare}
                label="Messages"
                value={agent.messages_limit?.toLocaleString("en-US") ?? "Not set"}
                detail="Current monthly usage cap for this agent."
                tone={agent.messages_limit ? "good" : "muted"}
              />
              <MetricCard
                icon={KeyRound}
                label="Created"
                value={createdAt}
                detail={`Key ending in ${agent.api_key.slice(-6)}`}
                tone="muted"
              />
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Launch readiness
                </p>
                <span className="text-2xl font-semibold text-white">
                  {completionPercent}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Next step: <span className="text-emerald-200">{nextStep}</span>
              </p>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {saved && (
          <div
            className="ui-alert ui-alert--success items-center mt-6"
            data-oid="qai4ugb"
          >
            Changes saved successfully.
          </div>
        )}
        {errorKey && (
          <div className="ui-alert ui-alert--error mt-6" data-oid="iiw:3dy">
            {errorMessages[errorKey] ?? "An unexpected error occurred."}
          </div>
        )}

        <form action={updateAgentAndWidget} data-oid="6_2z8c2">
          <input
            type="hidden"
            name="agent_id"
            value={agent.id}
            data-oid="761fhl8"
          />

          <div
            className="
              mt-10 grid gap-10
              lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]
              xl:grid-cols-[minmax(0,1.85fr)_minmax(380px,1fr)]
              2xl:grid-cols-[minmax(0,2fr)_minmax(420px,1fr)]
            "
            data-oid="imdvyb:"
          >
            <article
              id="setup"
              className="min-w-0 ui-card glass-pane p-7"
              data-oid="_cmxgf2"
            >
              <SectionHeading
                eyebrow="Setup"
                title="Integration, behavior, and access"
                description="Connect catalog data, define response behavior, and lock the widget to approved domains."
              />

              <div className="mt-6 space-y-6" data-oid="l4:ji3-">
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
                    placeholder="https://your-agency.com/contact"
                    className="ui-input"
                    data-oid="c-aq-hb"
                  />

                  <p className="text-xs text-slate-500" data-oid="2nyqjet">
                    Sent to the widget to escalate to humans when necessary.
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
            </article>

            <aside className="space-y-6 min-w-0" data-oid="1sn3crl">
              <article className="ui-card glass-pane p-6">
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

              <div id="install">
                <EmbedSnippet apiKey={agent.api_key} data-oid="__4rke1" />
              </div>

              <article
                className="ui-card glass-pane p-6 text-sm text-slate-300"
                data-oid="n.i41pq"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-slate-200">
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
            </aside>

            <div id="knowledge" className="lg:col-span-2">
              <KnowledgeSection agentId={agent.id} data-oid="_hxpw0u" />
            </div>

            <article
              id="widget"
              className="lg:col-span-2 w-full min-w-0 ui-card glass-pane p-2"
              data-oid="w4rdr2m"
            >
              <div className="p-5 pb-0">
                <SectionHeading
                  eyebrow="Widget"
                  title="Customize the embeddable widget"
                  description="Adjust colors, visible text, position, and preview behavior before publishing."
                />
              </div>

              <WidgetDesigner
                apiKey={agent.api_key}
                siteUrl={siteUrl}
                initialAccent={agent.widget_accent}
                initialBrand={agent.widget_brand}
                initialLabel={agent.widget_label}
                initialGreeting={agent.widget_greeting}
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
                data-oid=".2z0p3q"
              />
            </article>
          </div>

          <div className="sticky bottom-6 z-20 mt-10" data-oid="eaj.k4d">
            <div
              className="ui-card--strong glass-pane flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-end"
              data-oid="7f9q1ma"
            >
              <SubmitButton label="Save changes" data-oid="ew1c.ap" />
              <Link
                href={`${AGENTS_BASE}/${agent.id}`}
                className="ui-button ui-button--ghost w-full sm:w-auto"
                data-oid="g2dq6yg"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
