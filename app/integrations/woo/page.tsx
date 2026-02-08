//C:\ai-saas\app\integrations\woo\page.tsx
import Link from "next/link";
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
    return (
      "Sync failed. Please verify the credentials and try again." + details
    );
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

  return (
    <main className="bg-slate-950 text-slate-100" data-oid="xuhoeao">
      <section
        className="mx-auto max-w-5xl px-6 py-20 sm:px-10 lg:px-16"
        data-oid="8j18_br"
      >
        <header className="space-y-4" data-oid="ol_afpm">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
            data-oid="quy6sof"
          >
            Integrations
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" data-oid="xt98t8i">
            Manage your WooCommerce connections
          </h1>
          <p className="text-sm text-slate-300 sm:text-base" data-oid="jqa_6gj">
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
            data-oid="szov-yk"
          >
            {status?.text ?? errorMsg}
          </div>
        )}

        <div
          className="mt-10 grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(320px,1fr)]"
          data-oid="yz0z470"
        >
          <section
            className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur"
            data-oid="8ri07yi"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="j:k69ih">
              Register new store
            </h2>
            <p className="text-sm text-slate-300" data-oid="wkxox3b">
              The key and secret fields are encrypted with your{" "}
              <code
                className="rounded bg-slate-800 px-1 py-0.5 text-xs"
                data-oid="84em-l6"
              >
                CRED_ENC_KEY
              </code>{" "}
              and are never shown in full.
            </p>

            <form
              action={createWooIntegration}
              className="mt-6 space-y-5 text-sm"
              data-oid="h:grsl6"
            >
              <div className="grid gap-4 sm:grid-cols-2" data-oid="b4drbko">
                <label className="space-y-2" data-oid="ej2lrvf">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="o4wqyv6"
                  >
                    Internal label
                  </span>
                  <input
                    name="label"
                    required
                    maxLength={80}
                    placeholder="Main WooCommerce"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="z6_l30h"
                  />
                </label>
                <label className="space-y-2" data-oid="d3--2dv">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="xk_di1a"
                  >
                    Store URL
                  </span>
                  <input
                    name="site_url"
                    type="url"
                    required
                    placeholder="https://store.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="af7:ecn"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2" data-oid="jaq5d9e">
                <label className="space-y-2" data-oid="wo1bsk1">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="p-9su_x"
                  >
                    Consumer key
                  </span>
                  <input
                    name="consumer_key"
                    required
                    placeholder="ck_..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid=":llbrue"
                  />
                </label>
                <label className="space-y-2" data-oid="c1p4bp5">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="wtv3joi"
                  >
                    Consumer secret
                  </span>
                  <input
                    name="consumer_secret"
                    required
                    placeholder="cs_..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="jor.axv"
                  />
                </label>
              </div>

              <label
                className="flex items-center gap-2 text-xs text-slate-400"
                data-oid="ac:o7vy"
              >
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                  data-oid="omz50iz"
                />
                Mark as active on creation
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"
                data-oid="em2y3y4"
              >
                Save integration
              </button>
            </form>

            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400"
              data-oid="xa:5yqz"
            >
              <p className="font-semibold text-slate-200" data-oid="b0pyax9">
                Where do I get the key?
              </p>
              <ol
                className="mt-2 list-decimal space-y-1 pl-5"
                data-oid="u61bk6r"
              >
                <li data-oid="-8mf_-m">
                  In WordPress, go to WooCommerce → Settings → Advanced → REST
                  API.
                </li>
                <li data-oid="-ra3yjz">
                  Create a key with read permissions and copy the key/secret.
                </li>
                <li data-oid="tx_gr.2">
                  Paste the values here to connect the store.
                </li>
              </ol>
            </div>
          </section>

          <section className="space-y-6" data-oid=".g7e7i:">
            <div
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur"
              data-oid="::-d7ej"
            >
              <div
                className="flex items-start justify-between gap-4"
                data-oid="7pnsm8o"
              >
                <div data-oid="hg62up9">
                  <h2
                    className="text-xl font-semibold text-white"
                    data-oid="g1q2.2l"
                  >
                    Registered integrations
                  </h2>
                  <p className="mt-1 text-sm text-slate-300" data-oid="8jj.ygd">
                    Assign these connections from the agent detail page to
                    enable WooCommerce data.
                  </p>
                </div>
                <Link
                  href="/dashboard/agents"
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                  data-oid="ij8mebw"
                >
                  View agents
                </Link>
              </div>

              {integrations && integrations.length > 0 ? (
                <ul className="mt-6 space-y-4" data-oid="3m219rz">
                  {integrations.map((integration) => (
                    <li
                      key={integration.id}
                      className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5"
                      data-oid="jvmtddo"
                    >
                      <div
                        className="flex flex-wrap items-center justify-between gap-3"
                        data-oid="o:8w8c9"
                      >
                        <div data-oid="uihp980">
                          <p
                            className="text-sm font-semibold text-white"
                            data-oid=":.hb5m6"
                          >
                            {integration.label}
                          </p>
                          <p
                            className="text-xs text-slate-400"
                            data-oid="16o809k"
                          >
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
                          data-oid="gr-czh9"
                        >
                          {integration.is_active ? "Active" : "Paused"}
                        </span>
                      </div>

                      <details
                        className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4"
                        data-oid="rekxx-e"
                      >
                        <summary
                          className="cursor-pointer text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                          data-oid="33shjkv"
                        >
                          Edit integration
                        </summary>
                        <form
                          action={updateWooIntegration}
                          className="mt-4 space-y-4 text-sm"
                          data-oid="stb1wsf"
                        >
                          <input
                            type="hidden"
                            name="integration_id"
                            value={integration.id}
                            data-oid="w5zbfag"
                          />

                          <div
                            className="grid gap-3 sm:grid-cols-2"
                            data-oid="6bgvhzl"
                          >
                            <label className="space-y-2" data-oid="jau4o2f">
                              <span
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                                data-oid="oi8xgq:"
                              >
                                Internal label
                              </span>
                              <input
                                name="label"
                                defaultValue={integration.label ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                                data-oid="dw9ixrc"
                              />
                            </label>
                            <label className="space-y-2" data-oid="legaf0s">
                              <span
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                                data-oid="qrxh30b"
                              >
                                Store URL
                              </span>
                              <input
                                name="site_url"
                                type="url"
                                defaultValue={integration.store_url ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                                data-oid="dokpnsu"
                              />
                            </label>
                          </div>

                          <div
                            className="grid gap-3 sm:grid-cols-2"
                            data-oid="a24ibbb"
                          >
                            <label className="space-y-2" data-oid="_1pnh66">
                              <span
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                                data-oid="hmv:1d2"
                              >
                                Consumer key (leave empty to keep)
                              </span>
                              <input
                                name="consumer_key"
                                placeholder="ck_..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                                data-oid="kvls:yu"
                              />
                            </label>
                            <label className="space-y-2" data-oid=".832-np">
                              <span
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                                data-oid="rdifo5p"
                              >
                                Consumer secret (leave empty to keep)
                              </span>
                              <input
                                name="consumer_secret"
                                placeholder="cs_..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                                data-oid="wtsijxt"
                              />
                            </label>
                          </div>

                          <label
                            className="flex items-center gap-2 text-xs text-slate-400"
                            data-oid="47ubg8v"
                          >
                            <input
                              name="is_active"
                              type="checkbox"
                              defaultChecked={integration.is_active ?? false}
                              className="h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                              data-oid="95vrnkw"
                            />
                            Keep active
                          </label>

                          <div
                            className="flex flex-wrap gap-2"
                            data-oid="nd0m2j1"
                          >
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                              data-oid="js77y2."
                            >
                              Save changes
                            </button>
                          </div>
                        </form>
                      </details>
                      <SyncControls
                        integration={{
                          id: integration.id,
                          is_active: integration.is_active ?? false,
                          last_sync_status:
                            integration.last_sync_status ?? null,
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
                            ? `${getSiteUrl()}/api/integrations/woocommerce/webhook?integration_id=${
                                integration.id
                              }&token=${integration.webhook_token}`
                            : null
                        }
                        statusParam={statusParam}
                        errorParam={errorParam}
                        syncTargetId={syncTargetId}
                        onToggle={setWooIntegrationState}
                        onSync={syncWooIntegration}
                        onTest={testWooIntegration}
                        onDelete={deleteWooIntegration}
                        data-oid="a0ehs37"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="mt-6 space-y-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-300"
                  data-oid=":0yx-df"
                >
                  <p className="font-medium text-white" data-oid="dchc:12">
                    You haven’t connected any store yet.
                  </p>
                  <p data-oid="5hphh5-">
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
