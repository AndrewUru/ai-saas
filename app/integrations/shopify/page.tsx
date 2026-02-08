import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";
import SyncControls from "./SyncControls";
import {
  createShopifyIntegration,
  deleteShopifyIntegration,
  setShopifyIntegrationState,
  syncShopifyIntegration,
  testShopifyIntegration,
  updateShopifyIntegration,
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
      return "Token invalid or revoked. Reconnect the store." + details;
    }
    if (status === 403) {
      return "Missing access scope. Update scopes and reconnect." + details;
    }
    if (status === 404) {
      return "Shop not found or invalid domain." + details;
    }
    if (status === 429) {
      return "Rate limit. Retry in a few minutes." + details;
    }
    if (status && status >= 500) {
      return "Shopify returned a server error." + details;
    }
    return "Sync failed. Please verify the connection and try again." + details;
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

export default async function ShopifyIntegrationPage({
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
    .from("integrations_shopify")
    .select(
      "id, label, shop_domain, is_active, position, created_at, updated_at, last_sync_at, last_sync_status, last_sync_error, products_indexed_count, webhook_token",
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
    <main className="bg-slate-950 text-slate-100" data-oid="l05vp.j">
      <section
        className="mx-auto max-w-5xl px-6 py-20 sm:px-10 lg:px-16"
        data-oid="odasz1-"
      >
        <header className="space-y-4" data-oid="ibe_wer">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
            data-oid="rvy:23u"
          >
            Integrations
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" data-oid="bjx9ev_">
            Manage your Shopify connections
          </h1>
          <p className="text-sm text-slate-300 sm:text-base" data-oid="ecpzevn">
            Store each shop token so your agents can answer with real-time
            catalog data and availability.
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
            data-oid="rs1rq1u"
          >
            {status?.text ?? errorMsg}
          </div>
        )}

        <div
          className="mt-10 grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(320px,1fr)]"
          data-oid="0yujo6g"
        >
          <section
            className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur"
            data-oid="6hip_83"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="g5_kl6y">
              Register new store
            </h2>
            <p className="text-sm text-slate-300" data-oid="x9kqp8f">
              Shopify OAuth tokens are encrypted with your{" "}
              <code
                className="rounded bg-slate-800 px-1 py-0.5 text-xs"
                data-oid="zazeo.d"
              >
                CRED_ENC_KEY
              </code>{" "}
              and are never shown in full.
            </p>

            <form
              action={createShopifyIntegration}
              className="mt-6 space-y-5 text-sm"
              data-oid=":hvkqwt"
            >
              <div className="grid gap-4 sm:grid-cols-2" data-oid="mpx0mop">
                <label className="space-y-2" data-oid="bzvrf0:">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="7eewf:9"
                  >
                    Internal label
                  </span>
                  <input
                    name="label"
                    required
                    maxLength={80}
                    placeholder="Main Shopify"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="_9_:qw5"
                  />
                </label>
                <label className="space-y-2" data-oid="ddoqnp2">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                    data-oid="peexinv"
                  >
                    Shop domain
                  </span>
                  <input
                    name="shop_domain"
                    type="text"
                    required
                    placeholder="mystore.myshopify.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                    data-oid="ls.rs7j"
                  />
                </label>
              </div>

              <label
                className="flex items-center gap-2 text-xs text-slate-400"
                data-oid="03sij6s"
              >
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                  data-oid="fzwbdjm"
                />
                Mark as active on creation
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"
                data-oid="5excbtm"
              >
                Connect Shopify
              </button>
            </form>

            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400"
              data-oid="2jwake5"
            >
              <p className="font-semibold text-slate-200" data-oid="qi5p_2k">
                How does OAuth work?
              </p>
              <ol
                className="mt-2 list-decimal space-y-1 pl-5"
                data-oid="m3t2mzb"
              >
                <li data-oid="wtj7nju">
                  Enter the shop domain and click Connect Shopify.
                </li>
                <li data-oid="7e12try">
                  You will be redirected to Shopify to approve access.
                </li>
                <li data-oid="qjqjtxu">
                  After approval, the connection appears on the right list.
                </li>
              </ol>
            </div>
          </section>

          <section className="space-y-6" data-oid="v.5xw5l">
            <div
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur"
              data-oid="l9.4ncy"
            >
              <div
                className="flex items-start justify-between gap-4"
                data-oid="auyufj1"
              >
                <div data-oid="z6qyfq_">
                  <h2
                    className="text-xl font-semibold text-white"
                    data-oid="-zap6zk"
                  >
                    Registered integrations
                  </h2>
                  <p className="mt-1 text-sm text-slate-300" data-oid=":4rott0">
                    Assign these connections from the agent detail page to
                    enable Shopify data.
                  </p>
                </div>
                <Link
                  href="/dashboard/agents"
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                  data-oid=":2i6-.c"
                >
                  View agents
                </Link>
              </div>

              {integrations && integrations.length > 0 ? (
                <ul className="mt-6 space-y-4" data-oid="a8fok4p">
                  {integrations.map((integration) => (
                    <li
                      key={integration.id}
                      className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5"
                      data-oid="7wvu8cy"
                    >
                      <div
                        className="flex flex-wrap items-center justify-between gap-3"
                        data-oid=":gk_w-4"
                      >
                        <div data-oid="paes3p9">
                          <p
                            className="text-sm font-semibold text-white"
                            data-oid="81ryhzv"
                          >
                            {integration.label}
                          </p>
                          <p
                            className="text-xs text-slate-400"
                            data-oid="e1.3i8o"
                          >
                            {integration.shop_domain}
                          </p>
                        </div>
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                            integration.is_active
                              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-700 bg-slate-800/70 text-slate-300",
                          ].join(" ")}
                          data-oid="fu_72:m"
                        >
                          {integration.is_active ? "Active" : "Paused"}
                        </span>
                      </div>

                      <details
                        className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4"
                        data-oid="51mu022"
                      >
                        <summary
                          className="cursor-pointer text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                          data-oid="pt4h29i"
                        >
                          Edit integration
                        </summary>
                        <form
                          action={updateShopifyIntegration}
                          className="mt-4 space-y-4 text-sm"
                          data-oid="xxwo:jl"
                        >
                          <input
                            type="hidden"
                            name="integration_id"
                            value={integration.id}
                            data-oid="e8ch.ac"
                          />

                          <div
                            className="grid gap-3 sm:grid-cols-2"
                            data-oid=":vkahd-"
                          >
                            <label className="space-y-2" data-oid="eb57ym4">
                              <span
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                                data-oid="y::gxr3"
                              >
                                Internal label
                              </span>
                              <input
                                name="label"
                                defaultValue={integration.label ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                                data-oid="svoumsz"
                              />
                            </label>
                            <label className="space-y-2" data-oid="573xma8">
                              <span
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                                data-oid="wq7zt5g"
                              >
                                Shop domain (reauth if changed)
                              </span>
                              <input
                                name="shop_domain"
                                type="text"
                                defaultValue={integration.shop_domain ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                                data-oid="mhpu_7u"
                              />
                            </label>
                          </div>

                          <label
                            className="flex items-center gap-2 text-xs text-slate-400"
                            data-oid="tfbm0np"
                          >
                            <input
                              name="is_active"
                              type="checkbox"
                              defaultChecked={integration.is_active ?? false}
                              className="h-4 w-4 rounded border border-slate-600 bg-transparent text-emerald-400 focus:ring-emerald-400"
                              data-oid="i9u7qeg"
                            />
                            Keep active
                          </label>

                          <div
                            className="flex flex-wrap gap-2"
                            data-oid="f5kycno"
                          >
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                              data-oid="jie6vfh"
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
                        webhookUrl={null}
                        statusParam={statusParam}
                        errorParam={errorParam}
                        syncTargetId={syncTargetId}
                        onToggle={setShopifyIntegrationState}
                        onSync={syncShopifyIntegration}
                        onTest={testShopifyIntegration}
                        onDelete={deleteShopifyIntegration}
                        data-oid="6do4dby"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="mt-6 space-y-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-300"
                  data-oid="q86n69b"
                >
                  <p className="font-medium text-white" data-oid="dxmb2ty">
                    You have not connected any store yet.
                  </p>
                  <p data-oid="c8i:zbi">
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
