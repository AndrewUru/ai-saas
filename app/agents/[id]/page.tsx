//C:\ai-saas\app\agents\[id]\page.tsx
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServer } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import WidgetDesigner from "./WidgetDesigner";
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

// --- Server action ---------------------------------------------------------
async function updateIntegrationAndDomains(formData: FormData) {
  "use server";

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const agentId = String(formData.get("agent_id") ?? "");
  const integrationId = String(formData.get("integration_id") ?? "");
  const domainsRaw = String(formData.get("allowed_domains") ?? "");
  const promptSystemRaw = String(formData.get("prompt_system") ?? "");
  const languageRaw = String(formData.get("language") ?? "");
  const fallbackUrlRaw = String(formData.get("fallback_url") ?? "").trim();

  const allowedDomains = normalizeDomainList(domainsRaw);
  const wooIntegrationId =
    integrationId && integrationId !== "none" ? integrationId : null;
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
      redirect(`/agents/${agentId}?error=integration`);
    }
    if (integration && integration.is_active === false) {
      redirect(`/agents/${agentId}?error=integration_inactive`);
    }
  }

  const { error: updateError } = await supabase
    .from("agents")
    .update({
      woo_integration_id: wooIntegrationId,
      allowed_domains: allowedDomains.length ? allowedDomains : null,
      prompt_system: promptSystem,
      language,
      fallback_url: fallbackUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId)
    .eq("user_id", user.id);

  if (updateError) {
    redirect(`/agents/${agentId}?error=save`);
  }

  redirect(`/agents/${agentId}?saved=1`);
}

async function updateWidgetBranding(formData: FormData) {
  "use server";

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const agentId = String(formData.get("agent_id") ?? "");
  if (!agentId) redirect("/agents");

  const accentRaw = String(formData.get("widget_accent") ?? "");
  const brandRaw = String(formData.get("widget_brand") ?? "");
  const labelRaw = String(formData.get("widget_label") ?? "");
  const greetingRaw = String(formData.get("widget_greeting") ?? "");
  const positionRaw = String(formData.get("widget_position") ?? "");

  const { error: updateError } = await supabase
    .from("agents")
    .update({
      widget_accent: accentRaw.trim() ? sanitizeHex(accentRaw) : null,
      widget_brand: normalizeWidgetText(brandRaw, widgetLimits.brand),
      widget_label: normalizeWidgetText(labelRaw, widgetLimits.label),
      widget_greeting: normalizeWidgetText(greetingRaw, widgetLimits.greeting),
      widget_position: positionRaw.trim()
        ? sanitizePosition(positionRaw)
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId)
    .eq("user_id", user.id);

  if (updateError) {
    redirect(`/agents/${agentId}?error=widget`);
  }

  redirect(`/agents/${agentId}?widget_saved=1`);
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

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select(
      "id, user_id, name, api_key, woo_integration_id, allowed_domains, messages_limit, is_active, created_at, prompt_system, language, fallback_url, description, widget_accent, widget_brand, widget_label, widget_greeting, widget_position"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (agentError || !agent) return notFound();

  const { data: integrations } = await supabase
    .from("integrations_woocommerce")
    .select("id, label, site_url, is_active, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const saved = resolvedSearchParams.saved === "1";
  const widgetSaved = resolvedSearchParams.widget_saved === "1";
  const errorParam = resolvedSearchParams.error;
  const errorKey = typeof errorParam === "string" ? errorParam : null;

  const errorMessages: Record<string, string> = {
    integration: "The selected integration does not belong to your account.",
    integration_inactive: "The selected integration is inactive.",
    save: "We could not save your changes. Please try again.",
    widget: "We could not save the widget customization.",
  };

  const statusLabel = agent.is_active ? "Active" : "Paused";
  const allowedDomains = agent.allowed_domains ?? [];
  const promptSystemValue = agent.prompt_system ?? "";
  const languageValue = agent.language ?? "auto";
  const fallbackUrlValue = agent.fallback_url ?? "";
  const descriptionFallback = agent.description ?? "";
  const statusColor = agent.is_active ? "bg-emerald-400" : "bg-slate-500";
  const widgetPositionValue =
    agent.widget_position === "left" || agent.widget_position === "right"
      ? agent.widget_position
      : null;
  const siteUrl = getSiteUrl();

  const widgetUrlParams = new URLSearchParams({ key: agent.api_key });
  if (agent.widget_accent) {
    widgetUrlParams.set("accent", agent.widget_accent.replace(/^#/, ""));
  }
  const widgetBrand = agent.widget_brand?.trim();
  if (widgetBrand) widgetUrlParams.set("brand", widgetBrand);

  const widgetLabel = agent.widget_label?.trim();
  if (widgetLabel) widgetUrlParams.set("label", widgetLabel);

  const widgetGreeting = agent.widget_greeting?.trim();
  if (widgetGreeting) widgetUrlParams.set("greeting", widgetGreeting);

  if (widgetPositionValue) widgetUrlParams.set("position", widgetPositionValue);
  const widgetScriptUrl = `${siteUrl}/api/widget?${widgetUrlParams.toString()}`;

  const createdAt = agent.created_at
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(agent.created_at))
    : "Unknown date";

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100"
      data-oid="5nde4u4"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_60%)]"
        data-oid="bk3to85"
      />

      <section
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-16 md:px-10 lg:px-16"
        data-oid="b-vhzuy"
      >
        <header
          className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur"
          data-oid="xtqys.."
        >
          <div
            className="flex flex-wrap items-start justify-between gap-6"
            data-oid="1u2yczr"
          >
            <div className="space-y-3" data-oid="i2p2-9.">
              <p
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200"
                data-oid="0dlwbcw"
              >
                Agent profile
              </p>
              <div
                className="flex flex-wrap items-center gap-3"
                data-oid="vcxdcc:"
              >
                <h1
                  className="text-3xl font-semibold leading-tight sm:text-4xl"
                  data-oid="7p.7axh"
                >
                  {agent.name}
                </h1>
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300"
                  data-oid="p4.d.3p"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
                    data-oid="8mh.-xf"
                  />

                  {statusLabel}
                </span>
              </div>
              <p
                className="max-w-2xl text-sm text-slate-300 sm:text-base"
                data-oid="5n39n:4"
              >
                Use this view to connect WooCommerce, control which domains can
                load the widget, and copy the agent API key.
              </p>
            </div>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
              data-oid="kv5fmuu"
            >
              Back to agents
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3" data-oid="8v..f-u">
            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300"
              data-oid="n5b0oba"
            >
              <p
                className="text-xs uppercase tracking-[0.24em] text-slate-400"
                data-oid="qmx3t2h"
              >
                API Key
              </p>
              <p
                className="mt-2 break-all font-mono text-emerald-200"
                data-oid="3e7.8ys"
              >
                {agent.api_key}
              </p>
            </div>
            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300"
              data-oid="n5xn3v1"
            >
              <p
                className="text-xs uppercase tracking-[0.24em] text-slate-400"
                data-oid="p.fs_ti"
              >
                Message limit
              </p>
              <p
                className="mt-2 text-lg font-semibold text-white"
                data-oid=":fbp3vm"
              >
                {agent.messages_limit?.toLocaleString("en-US") ?? "Not set"}
              </p>
              <p className="text-xs text-slate-500" data-oid="klqta:k">
                Adjust this value from the database or soon from your plan.
              </p>
            </div>
            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300"
              data-oid="1w1pm.q"
            >
              <p
                className="text-xs uppercase tracking-[0.24em] text-slate-400"
                data-oid="1ak26on"
              >
                Created on
              </p>
              <p
                className="mt-2 text-lg font-semibold text-white"
                data-oid="_z3qn9o"
              >
                {createdAt}
              </p>
              <p className="text-xs text-slate-500" data-oid="hgppn8m">
                Keeps a full activity log and allowed domains.
              </p>
            </div>
          </div>
        </header>

        {saved && (
          <div
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 shadow-lg shadow-emerald-500/20"
            data-oid="ux46g7i"
          >
            Changes saved successfully.
          </div>
        )}
        {widgetSaved && (
          <div
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 shadow-lg shadow-emerald-500/20"
            data-oid="o3ru:en"
          >
            Widget customization saved.
          </div>
        )}
        {errorKey && (
          <div
            className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100 shadow-lg shadow-rose-500/20"
            data-oid="ejtkdg0"
          >
            {errorMessages[errorKey] ?? "An unexpected error occurred."}
          </div>
        )}

        <div
          className="
            grid gap-10
            lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]
            xl:grid-cols-[minmax(0,1.85fr)_minmax(380px,1fr)]
            2xl:grid-cols-[minmax(0,2fr)_minmax(420px,1fr)]
          "
          data-oid="9m1.a4i"
        >
          {/* LEFT COLUMN TOP: Integration + domains */}
          <article
            className="min-w-0 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur"
            data-oid="vgt:6to"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="o8d-_8w">
              Integration and allowed domains
            </h2>
            <p className="mt-1 text-sm text-slate-300" data-oid="-vl6t.d">
              Select the WooCommerce integration this agent should use and
              define which domains can embed the widget.
            </p>

            {/* Keep the entire form exactly as it is */}
            <form
              action={updateIntegrationAndDomains}
              className="mt-6 space-y-6"
              data-oid="q_-3u9a"
            >
              <input
                type="hidden"
                name="agent_id"
                value={agent.id}
                data-oid="-vq.ua_"
              />

              <div className="space-y-2" data-oid="z:wzhrp">
                <label
                  htmlFor="integration"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  data-oid="nkfp-u:"
                >
                  WooCommerce integration
                </label>
                <select
                  id="integration"
                  name="integration_id"
                  defaultValue={agent.woo_integration_id || "none"}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  data-oid="h3757ia"
                >
                  <option value="none" data-oid=":626qar">
                    No integration
                  </option>
                  {(integrations ?? []).map((integration) => {
                    const label =
                      integration.label?.trim() || integration.site_url;
                    return (
                      <option
                        key={integration.id}
                        value={integration.id}
                        data-oid="jbsgh4:"
                      >
                        {label} {integration.is_active ? "" : "(inactive)"}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-slate-500" data-oid=".-seh8t">
                  Manage your credentials and connected sites from{" "}
                  <Link
                    href="/integrations/woo"
                    className="text-emerald-300 hover:text-emerald-200"
                    data-oid="zq5csv8"
                  >
                    Integrations
                  </Link>
                  .
                </p>
              </div>

              <div className="space-y-2" data-oid="znx8fj7">
                <label
                  htmlFor="prompt-system"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  data-oid="40p.dsg"
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
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  data-oid="rsg2:49"
                />

                <p className="text-xs text-slate-500" data-oid="msp58.n">
                  This text is sent as the system prompt to the model. Use
                  variables, the desired tone, and brand guardrails.
                </p>
              </div>

              <div className="space-y-2" data-oid="5h4fsnr">
                <label
                  htmlFor="language"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  data-oid="ma.3o09"
                >
                  Preferred response language
                </label>
                <select
                  id="language"
                  name="language"
                  defaultValue={languageValue}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  data-oid="6l05_.p"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      data-oid="p3.ozie"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500" data-oid=".of0xf0">
                  With automatic detection, the model adapts the response to the
                  customer&apos;s language.
                </p>
              </div>

              <div className="space-y-2" data-oid="u8vdvb:">
                <label
                  htmlFor="fallback-url"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  data-oid="ddpxzr7"
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
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  data-oid="..o7do6"
                />

                <p className="text-xs text-slate-500" data-oid="8v0kij7">
                  Sent to the widget to escalate to humans when necessary.
                </p>
              </div>

              <div className="space-y-2" data-oid="lsi9jqi">
                <label
                  htmlFor="allowed-domains"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  data-oid="4jmy990"
                >
                  Allowed domains (optional)
                </label>
                <input
                  id="allowed-domains"
                  name="allowed_domains"
                  placeholder="myshop.com, store.com"
                  defaultValue={allowedDomains.join(", ")}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  data-oid="4winsyn"
                />

                <p className="text-xs text-slate-500" data-oid="547hcs6">
                  Separate each domain with commas. If left empty, the widget
                  can load from any origin.
                </p>
                {!!allowedDomains.length && (
                  <p className="text-xs text-slate-400" data-oid="j.1vkzc">
                    Current domains:{" "}
                    <span
                      className="font-mono text-emerald-200"
                      data-oid="mp6p8il"
                    >
                      {allowedDomains.join(", ")}
                    </span>
                  </p>
                )}
              </div>

              <div
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                data-oid="f23y85m"
              >
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"
                  data-oid="g:a3b_n"
                >
                  Save changes
                </button>
                <Link
                  href={`/agents/${agent.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 sm:w-auto"
                  data-oid="l5ynrvq"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </article>

          {/* RIGHT COLUMN TOP: snippet + best practices */}
          <aside className="space-y-6 min-w-0" data-oid="no9w3th">
            <article
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
              data-oid="9s_wyt2"
            >
              <h3
                className="text-lg font-semibold text-white"
                data-oid="jm::wov"
              >
                Embed snippet
              </h3>
              <p className="mt-2 text-sm text-slate-300" data-oid=":kfo7gj">
                Copy and paste this script into your WordPress (footer or HTML
                widget). It includes your API key and the branding values
                configured above.
              </p>
              <pre
                className="mt-4 max-h-64 overflow-auto rounded-2xl bg-slate-950/80 p-4 text-[11px] leading-relaxed text-emerald-200"
                data-oid="y32oes5"
              >
                {`<script>
  (function () {
    var s = document.createElement('script');
    s.src = '${widgetScriptUrl}';
    s.async = true;
    s.defer = true;
    s.onerror = function(){ console.error("[AI SaaS] Could not load the widget."); };
    document.head.appendChild(s);
  })();
</script>`}
              </pre>

              <p className="mt-3 text-xs text-slate-500" data-oid="0m_0vll">
                The widget will check the active plan and respect the defined
                limits before showing the chat.
              </p>
            </article>

            <article
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 text-sm text-slate-300 shadow-lg shadow-slate-900/40 backdrop-blur"
              data-oid=".sku.hl"
            >
              <h3
                className="text-lg font-semibold text-white"
                data-oid="fv3.m8j"
              >
                Best practices
              </h3>
              <ul
                className="mt-3 space-y-2 text-xs text-slate-400"
                data-oid="8a_zbch"
              >
                <li data-oid="6tqf_u-">
                  - Use one agent per store or language to keep responses
                  aligned with your catalog.
                </li>
                <li data-oid="zqn.dxx">
                  - If the API key is compromised, create a new agent and
                  deactivate this one to revoke access.
                </li>
                <li data-oid="4-5yftx">
                  - Enable message limit alerts from your billing panel to avoid
                  interruptions.
                </li>
              </ul>
            </article>
          </aside>

          {/* FILA INFERIOR: ancho completo */}
          <article
            className="lg:col-span-2 w-full min-w-0 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur"
            data-oid="7uz0fmi"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="o127-9d">
              Customize the embeddable widget
            </h2>
            <p className="mt-1 text-sm text-slate-300" data-oid="gyb7lbe">
              Adjust color, text, and position and preview the result in real
              time before copying the script.
            </p>

            <WidgetDesigner
              formAction={updateWidgetBranding}
              agentId={agent.id}
              apiKey={agent.api_key}
              siteUrl={siteUrl}
              initialAccent={agent.widget_accent}
              initialBrand={agent.widget_brand}
              initialLabel={agent.widget_label}
              initialGreeting={agent.widget_greeting}
              initialPosition={widgetPositionValue}
              data-oid="qs3rk03"
            />
          </article>
        </div>
      </section>
    </main>
  );
}
