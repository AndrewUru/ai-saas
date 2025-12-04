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
  { value: "auto", label: "Deteccion automatica" },
  { value: "es", label: "Espanol" },
  { value: "en", label: "Ingles" },
  { value: "pt", label: "Portugues" },
  { value: "fr", label: "Frances" },
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
      "id, user_id, name, api_key, woo_integration_id, allowed_domains, messages_limit, is_active, created_at, prompt_system, language, fallback_url, description, widget_accent, widget_brand, widget_label, widget_greeting, widget_position",
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
    integration: "La integracion seleccionada no pertenece a tu cuenta.",
    integration_inactive: "La integracion seleccionada esta inactiva.",
    save: "No pudimos guardar los cambios. Intenta nuevamente.",
    widget: "No pudimos guardar la personalizacion del widget.",
  };

  const statusLabel = agent.is_active ? "Activo" : "Pausado";
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
    ? new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(agent.created_at))
    : "Fecha desconocida";

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
                Ficha del agente
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
                Usa esta vista para vincular WooCommerce, controlar desde que
                dominios se puede cargar el widget y copiar la API key del
                agente.
              </p>
            </div>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
              data-oid="kv5fmuu"
            >
              Volver a agentes
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
                Limite de mensajes
              </p>
              <p
                className="mt-2 text-lg font-semibold text-white"
                data-oid=":fbp3vm"
              >
                {agent.messages_limit?.toLocaleString("es-ES") ?? "Sin definir"}
              </p>
              <p className="text-xs text-slate-500" data-oid="klqta:k">
                Ajusta este valor desde la base de datos o proximamente desde el
                plan.
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
                Creado el
              </p>
              <p
                className="mt-2 text-lg font-semibold text-white"
                data-oid="_z3qn9o"
              >
                {createdAt}
              </p>
              <p className="text-xs text-slate-500" data-oid="hgppn8m">
                Mantiene registro completo de actividad y dominios permitidos.
              </p>
            </div>
          </div>
        </header>

        {saved && (
          <div
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 shadow-lg shadow-emerald-500/20"
            data-oid="ux46g7i"
          >
            Cambios guardados correctamente.
          </div>
        )}
        {widgetSaved && (
          <div
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 shadow-lg shadow-emerald-500/20"
            data-oid="o3ru:en"
          >
            Personalizacion del widget guardada.
          </div>
        )}
        {errorKey && (
          <div
            className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100 shadow-lg shadow-rose-500/20"
            data-oid="ejtkdg0"
          >
            {errorMessages[errorKey] ?? "Ocurrio un error inesperado."}
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
          <div className="space-y-8 min-w-0" data-oid="sru7.4l">
            <article
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur"
              data-oid="vgt:6to"
            >
              <h2
                className="text-xl font-semibold text-white"
                data-oid="o8d-_8w"
              >
                Integracion y dominios permitidos
              </h2>
              <p className="mt-1 text-sm text-slate-300" data-oid="-vl6t.d">
                Selecciona la integracion WooCommerce que debe usar este agente
                y define que dominios pueden embeber el widget.
              </p>

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
                    Integracion WooCommerce
                  </label>
                  <select
                    id="integration"
                    name="integration_id"
                    defaultValue={agent.woo_integration_id || "none"}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="h3757ia"
                  >
                    <option value="none" data-oid=":626qar">
                      Sin integracion
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
                          {label} {integration.is_active ? "" : "(inactiva)"}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-500" data-oid=".-seh8t">
                    Gestiona tus credenciales y sitios conectados desde{" "}
                    <Link
                      href="/integrations/woo"
                      className="text-emerald-300 hover:text-emerald-200"
                      data-oid="zq5csv8"
                    >
                      Integraciones
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
                    Instrucciones del agente (prompt)
                  </label>
                  <textarea
                    id="prompt-system"
                    name="prompt_system"
                    defaultValue={promptSystemValue}
                    placeholder={
                      descriptionFallback ||
                      "Describe tono, politicas y objetivos del agente."
                    }
                    rows={5}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="rsg2:49"
                  />

                  <p className="text-xs text-slate-500" data-oid="msp58.n">
                    Este texto se envia como prompt de sistema al modelo. Usa
                    variables, tono deseado y pasos de validacion para la marca.
                  </p>
                </div>

                <div className="space-y-2" data-oid="5h4fsnr">
                  <label
                    htmlFor="language"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="ma.3o09"
                  >
                    Idioma de respuesta preferido
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
                    En deteccion automatica, el modelo adapta la respuesta al
                    idioma del cliente.
                  </p>
                </div>

                <div className="space-y-2" data-oid="u8vdvb:">
                  <label
                    htmlFor="fallback-url"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="ddpxzr7"
                  >
                    URL de fallback (opcional)
                  </label>
                  <input
                    id="fallback-url"
                    name="fallback_url"
                    type="url"
                    inputMode="url"
                    defaultValue={fallbackUrlValue}
                    placeholder="https://tu-agencia.com/contacto"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="..o7do6"
                  />

                  <p className="text-xs text-slate-500" data-oid="8v0kij7">
                    Se enviara al widget para escalar con humanos cuando sea
                    necesario.
                  </p>
                </div>

                <div className="space-y-2" data-oid="lsi9jqi">
                  <label
                    htmlFor="allowed-domains"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="4jmy990"
                  >
                    Dominios permitidos (opcional)
                  </label>
                  <input
                    id="allowed-domains"
                    name="allowed_domains"
                    placeholder="midominio.com, tienda.com"
                    defaultValue={allowedDomains.join(", ")}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="4winsyn"
                  />

                  <p className="text-xs text-slate-500" data-oid="547hcs6">
                    Separa cada dominio con comas. Si lo dejas vacio, el widget
                    se podra cargar desde cualquier origen.
                  </p>
                  {!!allowedDomains.length && (
                    <p className="text-xs text-slate-400" data-oid="j.1vkzc">
                      Dominios actuales:{" "}
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
                    Guardar cambios
                  </button>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 sm:w-auto"
                    data-oid="l5ynrvq"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </article>

            <article
              className="w-full min-w-0 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur"
              data-oid="7uz0fmi"
            >
              <h2
                className="text-xl font-semibold text-white"
                data-oid="o127-9d"
              >
                Personaliza el widget embebible
              </h2>
              <p className="mt-1 text-sm text-slate-300" data-oid="gyb7lbe">
                Ajusta color, textos y posicion y prueba el resultado en tiempo
                real antes de copiar el script.
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
          <aside className="space-y-6 min-w-0" data-oid="no9w3th">
            <article
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
              data-oid="9s_wyt2"
            >
              <h3
                className="text-lg font-semibold text-white"
                data-oid="jm::wov"
              >
                Snippet de incrustacion
              </h3>
              <p className="mt-2 text-sm text-slate-300" data-oid=":kfo7gj">
                Copia y pega este script en tu WordPress (footer o widget HTML).
                Incluye tu API key y los valores de branding configurados
                arriba.
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
    s.onerror = function(){ console.error("[AI SaaS] No se pudo cargar el widget."); };
    document.head.appendChild(s);
  })();
</script>`}
              </pre>

              <p className="mt-3 text-xs text-slate-500" data-oid="0m_0vll">
                El widget verificara el plan activo y respetara los limites
                definidos antes de mostrar el chat.
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
                Buenas practicas
              </h3>
              <ul
                className="mt-3 space-y-2 text-xs text-slate-400"
                data-oid="8a_zbch"
              >
                <li data-oid="6tqf_u-">
                  - Usa un agente por cada tienda o idioma para mantener las
                  respuestas alineadas con tu catalogo.
                </li>
                <li data-oid="zqn.dxx">
                  - Si la API key se compromete, genera un nuevo agente y
                  desactiva este para revocar el acceso.
                </li>
                <li data-oid="4-5yftx">
                  - Activa alertas de limite de mensajes desde tu panel de
                  facturacion para evitar interrupciones.
                </li>
              </ul>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
