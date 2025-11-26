import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

const defaultMessagesLimit = 1000;

export default async function AgentsPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  async function createAgent(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const apiKey =
      "agt_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

    await supabase.from("agents").insert({
      user_id: user.id,
      name,
      api_key: apiKey,
      is_active: true,
      messages_limit: defaultMessagesLimit,
    });

    redirect("/agents");
  }

  async function deleteAgent(formData: FormData) {
    "use server";

    const id = String(formData.get("agent_id") ?? "").trim();
    if (!id) return;

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("agents").delete().eq("id", id).eq("user_id", user.id);

    redirect("/agents");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_60%)]" />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-16 md:px-10 lg:px-16">
        <header className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] md:items-center md:gap-8">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Centro de agentes
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Diseña y controla tus agentes de comercio
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Verifica integraciones, copia las API keys y ajusta los límites de
              mensajes en segundos. Cada agente puede conectarse a un sitio
              WooCommerce distinto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#create-agent"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Crear agente
              </Link>
              <Link
                href="/integrations/woo"
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
              >
                Revisar integraciones
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-inner shadow-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Agentes registrados
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {agents?.length ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Mantén tus agentes bajo control para respuestas rápidas.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-inner shadow-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Límite inicial
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {defaultMessagesLimit.toLocaleString("es-ES")} mensajes
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ajusta el límite por agente según tu plan.
              </p>
            </div>
          </div>
        </header>

        <div
          className="
    grid gap-10
    lg:grid-cols-[minmax(0,1.5fr)_360px]
    xl:grid-cols-[minmax(0,1.8fr)_380px]
    2xl:grid-cols-[minmax(0,2fr)_420px]
    w-full
  "
        >
          <section className="space-y-6 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">
                  Tus agentes activos
                </h2>
                <p className="text-sm text-slate-300">
                  Crea agentes segmentados por marca, idioma o catálogo y
                  configúralos desde su ficha.
                </p>
              </div>
              <Link
                href="#create-agent"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Nuevo agente
              </Link>
            </div>

            {!agents?.length ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-300">
                <p className="font-medium text-white">
                  Aún no tienes agentes configurados.
                </p>
                <p className="mt-2">
                  Crea tu primer agente para generar API keys únicas y comenzar
                  a automatizar respuestas en tu ecommerce.
                </p>
                <Link
                  href="#create-agent"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Crear agente ahora
                </Link>
              </div>
            ) : (
              <ul className="space-y-4 min-w-0">
                {agents.map((agent) => {
                  const statusColor = agent.is_active
                    ? "bg-emerald-400"
                    : "bg-slate-500";
                  const statusText = agent.is_active ? "Activo" : "Pausado";
                  const maskedKey = `${
                    agent.api_key?.slice(0, 6) ?? "N/A"
                  }...`;
                  const limit = agent.messages_limit ?? defaultMessagesLimit;

                  return (
                    <li
                      key={agent.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg shadow-slate-900/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
                          />
                          <span className="text-base font-semibold text-white">
                            {agent.name}
                          </span>
                          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                            {statusText}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-full bg-slate-900/80 px-2 py-1">
                            API Key:{" "}
                            <span className="font-mono text-slate-100">
                              {maskedKey}
                            </span>
                          </span>
                          <span className="rounded-full bg-slate-900/80 px-2 py-1">
                            Límite: {limit.toLocaleString("es-ES")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                        >
                          Configurar
                        </Link>
                        <form action={deleteAgent} className="contents">
                          <input
                            type="hidden"
                            name="agent_id"
                            value={agent.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-red-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-100 transition hover:border-red-400 hover:text-red-200"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside
            id="create-agent"
            className="min-w-0 space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                Nuevo agente
              </p>
              <h2 className="text-lg font-semibold text-white">
                Genera una API key en segundos
              </h2>
              <p className="text-sm text-slate-300">
                Asigna un nombre descriptivo para identificar rápidamente el
                canal o la marca asociada. Podrás editar límites y credenciales
                después.
              </p>
            </div>

            <form action={createAgent} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="agent-name"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                >
                  Nombre del agente
                </label>
                <input
                  id="agent-name"
                  name="name"
                  placeholder="Soporte WooCommerce"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Generar agente
              </button>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
              <p>
                El snippet de incrustación se genera automáticamente en la ficha
                del agente con su API key incluida; no necesitas copiarla
                manualmente.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
              <p>
                Cada agente comienza con un límite de{" "}
                {defaultMessagesLimit.toLocaleString("es-ES")} mensajes. Ajusta
                el valor al crecer tu plan o tu volumen de ventas.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
