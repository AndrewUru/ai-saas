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
import { getSiteUrl } from "@/lib/site";
import SyncControls from "./SyncControls";
import {
  createWooIntegration,
  deleteWooIntegration,
  setWooIntegrationState,
  syncWooIntegration,
  testWooIntegration,
  updateWooIntegration,
} from "./actions";

export const runtime = "nodejs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const inputClass =
  "w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40";

function statusMessage(status: string | null) {
  switch (status) {
    case "created":
      return {
        intent: "success" as const,
        text: "Integration created successfully.",
      };
    case "updated":
      return { intent: "success" as const, text: "Integration updated." };
    case "deleted":
      return { intent: "success" as const, text: "Integration deleted." };
    case "sync_ok":
      return { intent: "success" as const, text: "Sync completed." };
    case "test_ok":
      return { intent: "success" as const, text: "Connection looks good." };
    default:
      return null;
  }
}

function errorMessage(
  error: string | null,
  status: number | null,
  code: string | null,
) {
  if (error === "sync_failed") {
    const detailParts = [];
    if (status) detailParts.push(`status ${status}`);
    if (code) detailParts.push(`code ${code}`);
    const details = detailParts.length ? ` (${detailParts.join(", ")})` : "";

    if (status === 401) {
      return (
        "Invalid credentials or missing permissions. Regenerate the Woo API key with read access." +
        details
      );
    }
    if (status === 403) {
      return (
        "Blocked by security or WAF. Allow /wp-json/wc/v3 from Vercel." +
        details
      );
    }
    if (status === 404 || code === "rest_no_route") {
      return "Woo REST route unavailable. Review permalinks and WooCommerce." + details;
    }
    if (status === 429) {
      return "Rate limit. Try again in a few minutes." + details;
    }
    if (status && status >= 500) {
      return "The store server returned an error." + details;
    }
    return "Sync failed. Please verify the credentials and try again." + details;
  }

  switch (error) {
    case "invalid":
      return "Check the fields: there is invalid data.";
    case "db":
      return "We could not save the changes. Please try again.";
    case "unexpected":
      return "An unexpected error occurred while processing the integration.";
    default:
      return null;
  }
}

function formatSyncDate(value: string | null) {
  if (!value) return "Not synced";
  return new Intl.DateTimeFormat("en-US", {
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
          "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
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
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-emerald-200">
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
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
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

  const status = statusMessage(statusParam);
  const errorMsg = errorMessage(errorParam, statusCode, codeParam);
  const stores = integrations ?? [];
  const activeStores = stores.filter((integration) => integration.is_active).length;
  const indexedProducts = stores.reduce(
    (sum, integration) => sum + (integration.products_indexed_count ?? 0),
    0,
  );
  const syncedStores = stores.filter(
    (integration) => integration.last_sync_status === "success",
  ).length;
  const appUrl = getSiteUrl();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="min-w-0">
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-emerald-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Integrations
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                <Store className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  WooCommerce connection center
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  Connect stores, test credentials, sync products, and make
                  catalog data available inside your agent workspaces.
                </p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/agents" className="ui-button ui-button--secondary">
            View agents
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <div className="mt-6">
          <AlertBanner status={status} error={errorMsg} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatTile
            label="Stores"
            value={stores.length}
            detail={`${activeStores} active connection${activeStores === 1 ? "" : "s"}.`}
            icon={Store}
          />
          <StatTile
            label="Products indexed"
            value={indexedProducts.toLocaleString("en-US")}
            detail="Available to agents after sync."
            icon={RefreshCw}
          />
          <StatTile
            label="Healthy syncs"
            value={`${syncedStores}/${stores.length}`}
            detail="Stores with a successful latest product sync."
            icon={CheckCircle2}
          />
        </section>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(360px,0.78fr)_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="rounded-3xl border border-slate-800/80 bg-slate-900/45 p-5 shadow-xl shadow-black/20">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                  <PlugZap className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Connect a store
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Add a read-only WooCommerce REST API key. Secrets are
                    encrypted and never displayed again.
                  </p>
                </div>
              </div>

              <form action={createWooIntegration} className="mt-5 space-y-4">
                <FieldLabel label="Internal label">
                  <input
                    name="label"
                    required
                    maxLength={80}
                    placeholder="Main store"
                    className={inputClass}
                  />
                </FieldLabel>

                <FieldLabel label="Store URL">
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
                  <FieldLabel label="Consumer key">
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

                  <FieldLabel label="Consumer secret">
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
                    className="mt-0.5 h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                  />
                  <span>
                    <span className="block font-semibold text-slate-200">
                      Activate after saving
                    </span>
                    Agents can use this catalog as soon as credentials are
                    tested and products are synced.
                  </span>
                </label>

                <button type="submit" className="ui-button ui-button--primary w-full">
                  Save connection
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-800/80 bg-slate-900/35 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-white">Setup guide</h2>
              </div>
              <ol className="mt-4 space-y-3">
                <SetupStep
                  step="1"
                  title="Create a read key"
                  detail="In WordPress, open WooCommerce, Settings, Advanced, REST API."
                />
                <SetupStep
                  step="2"
                  title="Paste key and secret"
                  detail="Use read permissions. The values are encrypted after save."
                />
                <SetupStep
                  step="3"
                  title="Test, sync, assign"
                  detail="Verify the connection, sync products, then assign the store to an agent."
                />
              </ol>
            </section>
          </aside>

          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/45 p-4 shadow-xl shadow-black/20 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Connected stores
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  WooCommerce catalog sources
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  Each connection can be tested, synced, paused, edited, or
                  assigned from an agent workspace.
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
                                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                                : "border-slate-700 bg-slate-800/70 text-slate-300",
                            )}
                          >
                            {integration.is_active ? "Active" : "Paused"}
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
                        Assign
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          Products
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {(integration.products_indexed_count ?? 0).toLocaleString(
                            "en-US",
                          )}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          Last sync
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {formatSyncDate(integration.last_sync_at ?? null)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {integration.last_sync_status ?? "Not synced"}
                        </p>
                      </div>
                    </div>

                    <details className="rounded-xl border border-slate-800/70 bg-slate-900/35 p-4">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-200">
                        Edit credentials
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
                          <FieldLabel label="Internal label">
                            <input
                              name="label"
                              defaultValue={integration.label ?? ""}
                              required
                              className={inputClass}
                            />
                          </FieldLabel>
                          <FieldLabel label="Store URL">
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
                          <FieldLabel label="Consumer key">
                            <input
                              name="consumer_key"
                              placeholder="Leave empty to keep current key"
                              className={inputClass}
                            />
                          </FieldLabel>
                          <FieldLabel label="Consumer secret">
                            <input
                              name="consumer_secret"
                              placeholder="Leave empty to keep current secret"
                              className={inputClass}
                            />
                          </FieldLabel>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-400">
                          <input
                            name="is_active"
                            type="checkbox"
                            defaultChecked={integration.is_active ?? false}
                            className="h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                          />
                          Keep active
                        </label>

                        <button type="submit" className="ui-button ui-button--primary">
                          Save changes
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
                  No WooCommerce store connected yet.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Add a read-only REST API key from the form. After the first
                  sync, agents can answer with product and stock context.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
