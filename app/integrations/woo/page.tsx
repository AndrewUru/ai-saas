import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
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
  code: string | null
) {
  if (error === "sync_failed") {
    const detailParts = [];
    if (status) detailParts.push(`status ${status}`);
    if (code) detailParts.push(`code ${code}`);
    const details = detailParts.length ? ` (${detailParts.join(", ")})` : "";

    if (status === 401) {
      return (
        "Credenciales invalidas o sin permisos. Regenera la API key en Woo (Read)." +
        details
      );
    }
    if (status === 403) {
      return (
        "Bloqueado por seguridad/WAF. Permite /wp-json/wc/v3 desde Vercel." +
        details
      );
    }
    if (status === 404 || code === "rest_no_route") {
      return (
        "Ruta Woo REST no disponible. Revisa permalinks y WooCommerce." +
        details
      );
    }
    if (status === 429) {
      return "Rate limit. Reintenta en unos minutos." + details;
    }
    if (status && status >= 500) {
      return "Error del servidor de la tienda." + details;
    }
    return "Sync failed. Please verify the credentials and try again." + details;
  }

  switch (error) {
    case "invalid":
      return "Check the fields: there is invalid data.";
    case "db":
      return "We couldn??Tt save the changes. Please try again.";
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

export default async function WooIntegrationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : null;
  const errorParam = typeof params.error === "string" ? params.error : null;
  const codeParam = typeof params.code === "string" ? params.code : null;
  const statusCodeRaw =
    errorParam === "sync_failed" && statusParam ? Number(statusParam) : null;
  const statusCode =
    typeof statusCodeRaw === "number" && Number.isFinite(statusCodeRaw)
      ? statusCodeRaw
      : null;

  const { data: integrations, error } = await supabase
    .from("integrations_woocommerce")
    .select(
      "id, label, store_url, is_active, position, created_at, updated_at, last_sync_at, last_sync_status, last_sync_error, products_indexed_count, webhook_token"
    )
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const status = statusMessage(statusParam);
  const errorMsg = errorMessage(errorParam, statusCode, codeParam);

  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Integrations
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Manage your WooCommerce connections
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Store each shop’s credentials so your agents can reply with
            real-time stock, orders, and customer data.
          </p>
        </header>

        {(status || errorMsg) && (
          <div
            className={[
              "mt-6 rounded-3xl border px-5 py-4 text-sm",
              status?.intent === "success" &&
                "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
              errorMsg && "border-rose-500/40 bg-rose-500/10 text-rose-100",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {status?.text ?? errorMsg}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(320px,1fr)]">
          <section className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">
              Register new store
            </h2>
            <p className="text-sm text-slate-300">
              The key and secret fields are encrypted with your{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">
                CRED_ENC_KEY
              </code>{" "}
              and are never shown in full.
            </p>

            <form
              action={createWooIntegration}
              className="mt-6 space-y-5 text-sm"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Internal label
                  </span>
                  <input
                    name="label"
                    required
                    maxLength={80}
                    placeholder="Main WooCommerce"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Store URL
                  </span>
                  <input
                    name="site_url"
                    type="url"
                    required
                    placeholder="https://store.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Consumer key
                  </span>
                  <input
                    name="consumer_key"
                    required
                    placeholder="ck_..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Consumer secret
                  </span>
                  <input
                    name="consumer_secret"
                    required
                    placeholder="cs_..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                />
                Mark as active on creation
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"
              >
                Save integration
              </button>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">
                Where do I get the key?
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  In WordPress, go to WooCommerce → Settings → Advanced → REST
                  API.
                </li>
                <li>
                  Create a key with read permissions and copy the key/secret.
                </li>
                <li>Paste the values here to connect the store.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Registered integrations
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Assign these connections from the agent detail page to
                    enable WooCommerce data.
                  </p>
                </div>
                <Link
                  href="/agents"
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  View agents
                </Link>
              </div>

              {integrations && integrations.length > 0 ? (
                <ul className="mt-6 space-y-4">
                  {integrations.map((integration) => (
                    <li
                      key={integration.id}
                      className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {integration.label}
                          </p>
                          <p className="text-xs text-slate-400">
                            {integration.store_url}
                          </p>
                        </div>
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                            integration.is_active
                              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-700 bg-slate-800/70 text-slate-300",
                          ].join(" ")}
                        >
                          {integration.is_active ? "Active" : "Paused"}
                        </span>
                      </div>

                      <details className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Edit integration
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
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Internal label
                              </span>
                              <input
                                name="label"
                                defaultValue={integration.label ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Store URL
                              </span>
                              <input
                                name="site_url"
                                type="url"
                                defaultValue={integration.store_url ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                              />
                            </label>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Consumer key (leave empty to keep)
                              </span>
                              <input
                                name="consumer_key"
                                placeholder="ck_..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Consumer secret (leave empty to keep)
                              </span>
                              <input
                                name="consumer_secret"
                                placeholder="cs_..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                              />
                            </label>
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

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                            >
                              Save changes
                            </button>
                          </div>
                        </form>
                      </details>

                      <div className="grid gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-300">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Sync status
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {integration.last_sync_status ?? "Not synced"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Products indexed
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {integration.products_indexed_count ?? 0}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Last sync
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {formatSyncDate(integration.last_sync_at ?? null)}
                          </span>
                        </div>
                        {integration.last_sync_error && (
                          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                            {integration.last_sync_error}
                          </p>
                        )}
                        {integration.webhook_token && (
                          <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                              Webhook URL
                            </p>
                            <p className="mt-1 break-all font-mono text-[11px] text-emerald-200">
                              {`${getSiteUrl()}/api/integrations/woocommerce/webhook?integration_id=${integration.id}&token=${integration.webhook_token}`}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <form action={setWooIntegrationState}>
                          <input
                            type="hidden"
                            name="integration_id"
                            value={integration.id}
                          />

                          <input
                            type="hidden"
                            name="state"
                            value={
                              integration.is_active ? "deactivate" : "activate"
                            }
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                          >
                            {integration.is_active ? "Pause" : "Activate"}
                          </button>
                        </form>

                        <form action={testWooIntegration}>
                          <input
                            type="hidden"
                            name="integration_id"
                            value={integration.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                          >
                            Test connection
                          </button>
                        </form>

                        <form action={syncWooIntegration}>
                          <input
                            type="hidden"
                            name="integration_id"
                            value={integration.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-200 transition hover:border-emerald-400/70 hover:bg-emerald-500/20"
                          >
                            Sync products now
                          </button>
                        </form>

                        <form action={deleteWooIntegration}>
                          <input
                            type="hidden"
                            name="integration_id"
                            value={integration.id}
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-4 py-2 font-semibold text-rose-200 transition hover:border-rose-400 hover:text-rose-100"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-300">
                  <p className="font-medium text-white">
                    You haven’t connected any store yet.
                  </p>
                  <p>
                    Create your first integration using the steps on the left,
                    then assign it to an agent from its detail page.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
