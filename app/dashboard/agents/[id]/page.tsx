import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { getSiteUrl } from "@/lib/site";
import WidgetDesigner from "./WidgetDesigner";
import EmbedSnippet from "./EmbedSnippet";
import SubmitButton from "@/components/SubmitButton";
import KnowledgeSection from "./KnowledgeSection";

import { widgetLimits, sanitizeHex, sanitizePosition } from "@/lib/widget/defaults";

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

// --- Server action ---------------------------------------------------------
async function updateAgentAndWidget(formData: FormData) {
  "use server";

  const { supabase, user } = await requireUser();

  const agentId = String(formData.get("agent_id") ?? "");
  if (!agentId) redirect(AGENTS_BASE);

  const wooIntegrationRaw = String(formData.get("woo_integration_id") ?? "");
  const shopifyIntegrationRaw = String(
    formData.get("shopify_integration_id") ?? ""
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
    formData.get("widget_human_support_text") ?? ""
  );

  const colorHeaderBgRaw = String(formData.get("widget_color_header_bg") ?? "");
  const colorHeaderTextRaw = String(
    formData.get("widget_color_header_text") ?? ""
  );
  const colorChatBgRaw = String(formData.get("widget_color_chat_bg") ?? "");
  const colorUserBubbleBgRaw = String(
    formData.get("widget_color_user_bubble_bg") ?? ""
  );
  const colorUserBubbleTextRaw = String(
    formData.get("widget_color_user_bubble_text") ?? ""
  );
  const colorBotBubbleBgRaw = String(
    formData.get("widget_color_bot_bubble_bg") ?? ""
  );
  const colorBotBubbleTextRaw = String(
    formData.get("widget_color_bot_bubble_text") ?? ""
  );
  const colorToggleBgRaw = String(formData.get("widget_color_toggle_bg") ?? "");
  const colorToggleTextRaw = String(
    formData.get("widget_color_toggle_text") ?? ""
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
          : "https://placeholder.local"
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
        widgetLimits.humanSupportText
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
      "id, user_id, name, api_key, woo_integration_id, shopify_integration_id, allowed_domains, messages_limit, is_active, created_at, prompt_system, language, fallback_url, description, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_position, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (agentError || !agent) return notFound();

  const { data: wooIntegrations } = await supabase
    .from("integrations_woocommerce")
    .select(
      "id, label, store_url, is_active, created_at, last_sync_status, products_indexed_count"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: shopifyIntegrations } = await supabase
    .from("integrations_shopify")
    .select(
      "id, label, shop_domain, is_active, created_at, last_sync_status, products_indexed_count"
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
  const siteUrl = getSiteUrl();

  const createdAt = agent.created_at
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(agent.created_at))
    : "Unknown date";

  return (

    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0" />

      <section className="relative z-10 mx-auto flex min-h-screen flex-col">
        {/* Header */}
        <header className="space-y-4 ui-card--strong p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="ui-badge">
                Agent profile
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  {agent.name}
                </h1>
                <span className="ui-badge border-slate-700 text-slate-300 bg-transparent">
                  <span className={`dot ${agent.is_active ? 'dot--active' : 'dot--paused'}`} />
                  {statusLabel}
                </span>
              </div>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Use this view to connect WooCommerce or Shopify, control which
                domains can load the widget, and copy the agent API key.
              </p>
            </div>
            <Link
              href={AGENTS_BASE}
              className="ui-button ui-button--ghost"
            >
              Back to agents
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="ui-card p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                API Key
              </p>
              <p className="mt-2 break-all font-mono text-emerald-200">
                {agent.api_key}
              </p>
            </div>
            <div className="ui-card p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Message limit
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {agent.messages_limit?.toLocaleString("en-US") ?? "Not set"}
              </p>
              <p className="text-xs text-slate-500">
                Adjust this value from the database or soon from your plan.
              </p>
            </div>
            <div className="ui-card p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Created on
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {createdAt}
              </p>
              <p className="text-xs text-slate-500">
                Keeps a full activity log and allowed domains.
              </p>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {saved && (
          <div className="ui-alert ui-alert--success items-center mt-6">
            Changes saved successfully.
          </div>
        )}
        {errorKey && (
          <div className="ui-alert ui-alert--error mt-6">
            {errorMessages[errorKey] ?? "An unexpected error occurred."}
          </div>
        )}

        <form action={updateAgentAndWidget}>
          <input type="hidden" name="agent_id" value={agent.id} />
          <div
            className="
              mt-10 grid gap-10
              lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]
              xl:grid-cols-[minmax(0,1.85fr)_minmax(380px,1fr)]
              2xl:grid-cols-[minmax(0,2fr)_minmax(420px,1fr)]
            "
          >
            {/* LEFT COLUMN TOP: Integration + domains */}
            <article className="min-w-0 ui-card glass-pane p-7">
              <h2 className="text-xl font-semibold text-white">
                Integration and allowed domains
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Select the WooCommerce or Shopify integrations this agent should
                use and define which domains can embed the widget.
              </p>

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="woo-integration"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  >
                    WooCommerce integration
                  </label>
                  <select
                    id="woo-integration"
                    name="woo_integration_id"
                    defaultValue={agent.woo_integration_id || "none"}
                    className="ui-input"
                  >
                    <option value="none">No integration</option>
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
                        <option key={integration.id} value={integration.id}>
                          {label} - {syncLabel}{" "}
                          {integration.is_active ? "" : "(inactive)"}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-500">
                    Manage your WooCommerce credentials from{" "}
                    <Link
                      href="/integrations/woo"
                      className="text-emerald-300 hover:text-emerald-200"
                    >
                      Integrations
                    </Link>
                    .
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="shopify-integration"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  >
                    Shopify integration
                  </label>
                  <select
                    id="shopify-integration"
                    name="shopify_integration_id"
                    defaultValue={agent.shopify_integration_id || "none"}
                    className="ui-input"
                  >
                    <option value="none">No integration</option>
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
                        <option key={integration.id} value={integration.id}>
                          {label} - {syncLabel}{" "}
                          {integration.is_active ? "" : "(inactive)"}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-500">
                    Manage your Shopify credentials from{" "}
                    <Link
                      href="/integrations/shopify"
                      className="text-emerald-300 hover:text-emerald-200"
                    >
                      Integrations
                    </Link>
                    .
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="prompt-system"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
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
                  />

                  <p className="text-xs text-slate-500">
                    This text is sent as the system prompt to the model. Use
                    variables, the desired tone, and brand guardrails.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="language"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  >
                    Preferred response language
                  </label>
                  <select
                    id="language"
                    name="language"
                    defaultValue={languageValue}
                    className="ui-input"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    With automatic detection, the model adapts the response to
                    the customer&apos;s language.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="fallback-url"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
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
                  />

                  <p className="text-xs text-slate-500">
                    Sent to the widget to escalate to humans when necessary.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="allowed-domains"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  >
                    Allowed domains (optional)
                  </label>
                  <input
                    id="allowed-domains"
                    name="allowed_domains"
                    placeholder="myshop.com, store.com"
                    defaultValue={allowedDomains.join(", ")}
                    className="ui-input"
                  />

                  <p className="text-xs text-slate-500">
                    Separate each domain with commas. If left empty, the widget
                    can load from any origin.
                  </p>
                  {!!allowedDomains.length && (
                    <p className="text-xs text-slate-400">
                      Current domains:{" "}
                      <span className="font-mono text-emerald-200">
                        {allowedDomains.join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </article>

            {/* RIGHT COLUMN TOP: snippet + best practices */}
            <aside className="space-y-6 min-w-0">
              <article className="ui-card--strong glass-pane backdrop-blur relative overflow-hidden">
                {/* EmbedSnippet component usually has its own internal card but here we wrap it or let it handle its own styles? 
                    The user said "No cambies el contenido de los componentes hijos". 
                    The previous code had this wrapper, so I keep the wrapper but use ui-card. 
                */}
                <EmbedSnippet apiKey={agent.api_key} />
              </article>
              <article className="ui-card glass-pane p-6 text-sm text-slate-300">
                <h3 className="text-lg font-semibold text-white">
                  Best practices
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li>
                    - Use one agent per store or language to keep responses
                    aligned with your catalog.
                  </li>
                  <li>
                    - If the API key is compromised, create a new agent and
                    deactivate this one to revoke access.
                  </li>
                  <li>
                    - Enable message limit alerts from your billing panel to
                    avoid interruptions.
                  </li>
                </ul>
              </article>
            </aside>

            <KnowledgeSection agentId={agent.id} />

            {/* FILA INFERIOR: ancho completo */}
            <article className="lg:col-span-2 w-full min-w-0 ui-card glass-pane p-7">
              <h2 className="text-xl font-semibold text-white">
                Customize the embeddable widget
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Adjust color, text, and position and preview the result in real
                time before copying the script.
              </p>

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
              />
            </article>
          </div>

          <div className="sticky bottom-6 z-20 mt-10">
            <div className="ui-card--strong glass-pane flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-end">
              <SubmitButton label="Save changes" />
              <Link
                href={`${AGENTS_BASE}/${agent.id}`}
                className="ui-button ui-button--ghost w-full sm:w-auto"
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



