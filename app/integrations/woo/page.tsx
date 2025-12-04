import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";
import {
  createWooIntegration,
  deleteWooIntegration,
  setWooIntegrationState,
  updateWooIntegration,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function statusMessage(status: string | null) {
  switch (status) {
    case "created":
      return {
        intent: "success" as const,
        text: "Integracion creada correctamente.",
      };
    case "updated":
      return { intent: "success" as const, text: "Integracion actualizada." };
    case "deleted":
      return { intent: "success" as const, text: "Integracion eliminada." };
    default:
      return null;
  }
}

function errorMessage(error: string | null) {
  switch (error) {
    case "invalid":
      return "Revisa los campos: hay datos invalidos.";
    case "db":
      return "No pudimos guardar los cambios. Intenta nuevamente.";
    case "unexpected":
      return "Ocurrio un error inesperado procesando la integracion.";
    default:
      return null;
  }
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

  const { data: integrations, error } = await supabase
    .from("integrations_woocommerce")
    .select("id, label, site_url, is_active, position, created_at, updated_at")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const status = statusMessage(statusParam);
  const errorMsg = errorMessage(errorParam);

  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Integraciones
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Gestiona las conexiones WooCommerce
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Guarda las credenciales de cada tienda para que tus agentes
            respondan con datos de stock, pedidos y clientes en tiempo real.
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
              Registrar nueva tienda
            </h2>
            <p className="text-sm text-slate-300">
              Los campos de clave y secreto se cifran con tu{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">
                CRED_ENC_KEY
              </code>{" "}
              y nunca se muestran completos.
            </p>

            <form
              action={createWooIntegration}
              className="mt-6 space-y-5 text-sm"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Etiqueta interna
                  </span>
                  <input
                    name="label"
                    required
                    maxLength={80}
                    placeholder="WooCommerce principal"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    URL de la tienda
                  </span>
                  <input
                    name="site_url"
                    type="url"
                    required
                    placeholder="https://tienda.com"
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
                Marcar como activa al crear
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"
              >
                Guardar integracion
              </button>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">
                ¿Dónde obtengo la clave?
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  En WordPress, ve a WooCommerce → Ajustes → Avanzado → REST
                  API.
                </li>
                <li>
                  Crea una clave con permisos de lectura y copia el key/secret.
                </li>
                <li>Introduce los valores aquí para conectar la tienda.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Integraciones registradas
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Asigna estas conexiones desde la ficha del agente para
                    activar datos de WooCommerce.
                  </p>
                </div>
                <Link
                  href="/agents"
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  Ver agentes
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
                            {integration.site_url}
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
                          {integration.is_active ? "Activa" : "Pausada"}
                        </span>
                      </div>

                      <details className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Editar integracion
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
                                Etiqueta interna
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
                                URL de la tienda
                              </span>
                              <input
                                name="site_url"
                                type="url"
                                defaultValue={integration.site_url ?? ""}
                                required
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                              />
                            </label>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Consumer key (dejar vacio para mantener)
                              </span>
                              <input
                                name="consumer_key"
                                placeholder="ck_..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Consumer secret (dejar vacio para mantener)
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
                            Mantener activa
                          </label>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </form>
                      </details>

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
                            {integration.is_active ? "Pausar" : "Activar"}
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
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-300">
                  <p className="font-medium text-white">
                    Aun no has conectado ninguna tienda.
                  </p>
                  <p>
                    Crea tu primera integracion con los pasos de la izquierda y
                    despues asignala a un agente desde su ficha.
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
