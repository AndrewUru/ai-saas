import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  KeyRound,
  Link2,
  Lock,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";
import { format, intlLocales, type Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { getI18n } from "@/lib/i18n/server";
import { getSiteUrl } from "@/lib/site";
import SyncControls from "./SyncControls";
import {
  createWooIntegration,
  deleteWooIntegration,
  setWooIntegrationState,
  startWooConnection,
  syncWooIntegration,
  testWooIntegration,
  updateWooIntegration,
} from "./actions";

export const runtime = "nodejs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const inputClass =
  "w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/40";

type PageText = Messages["integrationPages"];

function statusMessage(status: string | null, ip: PageText) {
  switch (status) {
    case "created":
    case "updated":
    case "deleted":
    case "sync_ok":
    case "test_ok":
      return { intent: "success" as const, text: ip.status[status] };
    default:
      return null;
  }
}

function errorMessage(
  error: string | null,
  status: number | null,
  code: string | null,
  ip: PageText,
) {
  const pe = ip.woo.errors;
  if (error === "sync_failed") {
    const detailParts = [];
    if (status) detailParts.push(format(ip.errors.details, { status }));
    if (code) detailParts.push(format(ip.errors.detailsCode, { code }));
    const details = detailParts.length ? ` (${detailParts.join(", ")})` : "";

    if (status === 401) {
      return pe.unauthorized + details;
    }
    if (status === 403) {
      return pe.forbidden + details;
    }
    if (status === 404 || code === "rest_no_route") {
      return pe.notFound + details;
    }
    if (status === 429) {
      return ip.errors.rateLimit + details;
    }
    if (status && status >= 500) {
      return pe.server + details;
    }
    return pe.generic + details;
  }

  switch (error) {
    case "invalid":
    case "db":
    case "unexpected":
      return ip.errors[error];
    case "not_woo":
      return ip.woo.oneClick.notWoo;
    case "unreachable":
      return ip.woo.oneClick.unreachable;
    default:
      return null;
  }
}

function formatSyncDate(value: string | null, locale: Locale, fallback: string) {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(intlLocales[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function AlertBanner({
  status,
  error,
}: {
  status: ReturnType<typeof statusMessage>;
  error: string | null;
}) {
  if (!status && !error) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        status?.intent === "success" &&
          "border-neutral-500/35 bg-neutral-500/10 text-neutral-100",
        error && "border-rose-500/35 bg-rose-500/10 text-rose-100",
      )}
      role={error ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        {status ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span>{status?.text ?? error}</span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Store;
}) {
  return (
    <article className="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-neutral-200">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">{detail}</p>
    </article>
  );
}

function SetupStep({
  step,
  title,
  detail,
}: {
  step: string;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/35 p-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-400/25 bg-neutral-400/10 text-xs font-semibold text-neutral-200">
        {step}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">
          {detail}
        </span>
      </span>
    </li>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export default async function WooIntegrationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase, user } = await requireUser();
  const { locale, t } = await getI18n();
  const ip = t.integrationPages;

  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : null;
  const errorParam = typeof params.error === "string" ? params.error : null;
  const codeParam = typeof params.code === "string" ? params.code : null;
  const syncTargetId =
    typeof params.sync_id === "string" ? params.sync_id : null;
  const statusCodeRaw =
    errorParam === "sync_failed" && statusParam ? Number(statusParam) : null;
  const statusCode =
    typeof statusCodeRaw === "number" && Number.isFinite(statusCodeRaw)
      ? statusCodeRaw
      : null;

  const { data: integrations, error } = await supabase
    .from("integrations_woocommerce")
    .select(
      "id, label, store_url, is_active, position, created_at, updated_at, last_sync_at, last_sync_status, last_sync_error, products_indexed_count, webhook_token",
    )
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // WooCommerce sends the merchant back with success=1 (approved) or success=0.
  const wooReturn = typeof params.success === "string" ? params.success : null;
  const status =
    wooReturn === "1"
      ? { intent: "success" as const, text: ip.woo.oneClick.connected }
      : statusMessage(statusParam, ip);
  const errorMsg =
    wooReturn === "0"
      ? ip.woo.oneClick.denied
      : errorMessage(errorParam, statusCode, codeParam, ip);
  const stores = integrations ?? [];
  const activeStores = stores.filter((integration) => integration.is_active).length;
  const indexedProducts = stores.reduce(
    (sum, integration) => sum + (integration.products_indexed_count ?? 0),
    0,
  );
  const syncedStores = stores.filter(
    (integration) => integration.last_sync_status === "success",
  ).length;
  const appUrl = await getSiteUrl();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="min-w-0">
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-neutral-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {ip.integrations}
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-400/25 bg-neutral-400/10 text-neutral-200">
                <Store className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {ip.woo.title}
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  {ip.woo.intro}
                </p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/agents" className="ui-button ui-button--secondary">
            {ip.viewAgents}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <div className="mt-6">
          <AlertBanner status={status} error={errorMsg} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatTile
            label={ip.woo.stats.stores}
            value={stores.length}
            detail={
              activeStores === 1
                ? ip.woo.stats.activeOne
                : format(ip.woo.stats.activeMany, { count: activeStores })
            }
            icon={Store}
          />
          <StatTile
            label={ip.woo.stats.productsIndexed}
            value={indexedProducts.toLocaleString(intlLocales[locale])}
            detail={ip.woo.stats.productsDetail}
            icon={RefreshCw}
          />
          <StatTile
            label={ip.woo.stats.healthy}
            value={`${syncedStores}/${stores.length}`}
            detail={ip.woo.stats.healthyDetail}
            icon={CheckCircle2}
          />
        </section>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(360px,0.78fr)_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="rounded-3xl border border-slate-800/80 bg-slate-900/45 p-5 shadow-xl shadow-black/20">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-400/25 bg-neutral-400/10 text-neutral-200">
                  <PlugZap className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {ip.woo.oneClick.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {ip.woo.oneClick.intro}
                  </p>
                </div>
              </div>

              <form action={startWooConnection} className="mt-5 space-y-4">
                <FieldLabel label={ip.woo.storeUrl}>
                  <div className="relative">
                    <Link2
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      name="store_url"
                      type="text"
                      inputMode="url"
                      required
                      autoComplete="url"
                      placeholder="https://store.com"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FieldLabel>

                <FieldLabel label={ip.woo.oneClick.labelOptional}>
                  <input
                    name="label"
                    maxLength={80}
                    placeholder={ip.woo.labelPlaceholder}
                    className={inputClass}
                  />
                </FieldLabel>

                <p className="text-xs leading-5 text-slate-400">
                  {ip.woo.oneClick.permissions}
                </p>

                <button type="submit" className="ui-button ui-button--primary w-full">
                  <PlugZap className="h-4 w-4" aria-hidden="true" />
                  {ip.woo.oneClick.connect}
                </button>
              </form>

              <details className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-300 transition hover:text-white">
                  {ip.woo.oneClick.manualToggle}
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {ip.woo.connectIntro}
                </p>

                <form action={createWooIntegration} className="mt-5 space-y-4">
                  <FieldLabel label={ip.internalLabel}>
                    <input
                      name="label"
                      required
                      maxLength={80}
                      placeholder={ip.woo.labelPlaceholder}
                      className={inputClass}
                    />
                  </FieldLabel>

                  <FieldLabel label={ip.woo.storeUrl}>
                    <div className="relative">
                      <Link2
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        aria-hidden="true"
                      />
                      <input
                        name="site_url"
                        type="url"
                        required
                        placeholder="https://store.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </FieldLabel>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <FieldLabel label={ip.woo.consumerKey}>
                      <div className="relative">
                        <KeyRound
                          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          aria-hidden="true"
                        />
                        <input
                          name="consumer_key"
                          required
                          placeholder="ck_..."
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </FieldLabel>

                    <FieldLabel label={ip.woo.consumerSecret}>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                          aria-hidden="true"
                        />
                        <input
                          name="consumer_secret"
                          required
                          placeholder="cs_..."
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </FieldLabel>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/35 p-3 text-xs text-slate-400">
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border border-slate-600 bg-transparent text-neutral-400 focus:ring-neutral-400"
                    />
                    <span>
                      <span className="block font-semibold text-slate-200">
                        {ip.woo.activateTitle}
                      </span>
                      {ip.woo.activateBody}
                    </span>
                  </label>

                  <button type="submit" className="ui-button ui-button--primary w-full">
                    {ip.woo.save}
                  </button>
                </form>
              </details>
            </section>

            <section className="rounded-3xl border border-slate-800/80 bg-slate-900/35 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-neutral-200">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-white">{ip.woo.guideTitle}</h2>
              </div>
              <ol className="mt-4 space-y-3">
                {ip.woo.steps.map((step, index) => (
                  <SetupStep
                    key={step.title}
                    step={String(index + 1)}
                    title={step.title}
                    detail={step.detail}
                  />
                ))}
              </ol>
            </section>
          </aside>

          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/45 p-4 shadow-xl shadow-black/20 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200">
                  {ip.woo.connectedEyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {ip.woo.connectedTitle}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  {ip.woo.connectedIntro}
                </p>
              </div>
            </div>

            {stores.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {stores.map((integration) => (
                  <li
                    key={integration.id}
                    className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/45 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-white">
                            {integration.label}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                              integration.is_active
                                ? "border-neutral-400/35 bg-neutral-500/10 text-neutral-200"
                                : "border-slate-700 bg-slate-800/70 text-slate-300",
                            )}
                          >
                            {integration.is_active ? ip.active : ip.paused}
                          </span>
                        </div>
                        <p className="mt-1 break-all text-xs text-slate-400">
                          {integration.store_url}
                        </p>
                      </div>
                      <Link
                        href="/dashboard/agents"
                        className="ui-button ui-button--subtle h-9 px-3 text-xs"
                      >
                        {ip.woo.assign}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {ip.woo.products}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {(integration.products_indexed_count ?? 0).toLocaleString(
                            intlLocales[locale],
                          )}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {ip.woo.lastSync}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {formatSyncDate(integration.last_sync_at ?? null, locale, ip.notSynced)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {ip.woo.status}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {integration.last_sync_status ?? ip.notSynced}
                        </p>
                      </div>
                    </div>

                    <details className="rounded-xl border border-slate-800/70 bg-slate-900/35 p-4">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-200">
                        {ip.woo.editCredentials}
                      </summary>
                      <form
                        action={updateWooIntegration}
                        className="mt-4 space-y-4 text-sm"
                      >
                        <input
                          type="hidden"
                          name="integration_id"
                          value={integration.id}
                        />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FieldLabel label={ip.internalLabel}>
                            <input
                              name="label"
                              defaultValue={integration.label ?? ""}
                              required
                              className={inputClass}
                            />
                          </FieldLabel>
                          <FieldLabel label={ip.woo.storeUrl}>
                            <input
                              name="site_url"
                              type="url"
                              defaultValue={integration.store_url ?? ""}
                              required
                              className={inputClass}
                            />
                          </FieldLabel>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FieldLabel label={ip.woo.consumerKey}>
                            <input
                              name="consumer_key"
                              placeholder={ip.woo.keepKey}
                              className={inputClass}
                            />
                          </FieldLabel>
                          <FieldLabel label={ip.woo.consumerSecret}>
                            <input
                              name="consumer_secret"
                              placeholder={ip.woo.keepSecret}
                              className={inputClass}
                            />
                          </FieldLabel>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-400">
                          <input
                            name="is_active"
                            type="checkbox"
                            defaultChecked={integration.is_active ?? false}
                            className="h-4 w-4 rounded border border-slate-600 bg-transparent text-neutral-400 focus:ring-neutral-400"
                          />
                          {ip.keepActive}
                        </label>

                        <button type="submit" className="ui-button ui-button--primary">
                          {ip.saveChanges}
                        </button>
                      </form>
                    </details>

                    <SyncControls
                      integration={{
                        id: integration.id,
                        is_active: integration.is_active ?? false,
                        last_sync_status: integration.last_sync_status ?? null,
                        last_sync_error: integration.last_sync_error ?? null,
                        last_sync_at: integration.last_sync_at ?? null,
                        products_indexed_count:
                          integration.products_indexed_count ?? 0,
                      }}
                      formattedLastSync={formatSyncDate(
                        integration.last_sync_at ?? null,
                        locale,
                        ip.notSynced,
                      )}
                      webhookUrl={
                        integration.webhook_token
                          ? `${appUrl}/api/integrations/woocommerce/webhook?integration_id=${integration.id}&token=${integration.webhook_token}`
                          : null
                      }
                      statusParam={statusParam}
                      errorParam={errorParam}
                      syncTargetId={syncTargetId}
                      onToggle={setWooIntegrationState}
                      onSync={syncWooIntegration}
                      onTest={testWooIntegration}
                      onDelete={deleteWooIntegration}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
                <Store
                  className="mx-auto h-8 w-8 text-slate-500"
                  aria-hidden="true"
                />
                <p className="mt-4 font-medium text-white">
                  {ip.woo.emptyTitle}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {ip.woo.emptyBody}
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
