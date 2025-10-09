import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

const PLAN_LIMITS: Record<string, string> = {
  free: "1,000",
  basic: "2,000",
  pro: "10,000",
};

export default async function DashboardPage() {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, active_until")
    .eq("id", user.id)
    .single();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const totalAgents = agents?.length ?? 0;
  const activeAgents =
    agents?.filter((agent) => agent.is_active).length ?? 0;
  const plan = (profile?.plan ?? "free").toLowerCase();
  const planLabel = plan.toUpperCase();
  const planLimitLabel = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const activeUntil = profile?.active_until
    ? new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(profile.active_until))
    : "Sin fecha";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-16 md:px-10 lg:px-16">
        <header className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur md:flex md:items-center md:justify-between md:space-y-0">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Panel principal
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Hola, {user.email}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Gestiona tus agentes, revisa el estado de tu plan y comparte el widget
              con tus tiendas desde un solo lugar.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-300 md:text-right">
            <div>
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                Plan activo
              </span>
              <div className="text-lg font-semibold text-white">{planLabel}</div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                Vigente hasta
              </span>
              <div className="text-lg font-semibold text-white">{activeUntil}</div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_minmax(320px,1fr)]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-lg shadow-slate-900/40 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Agentes creados
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {totalAgents}
                </p>
                <p className="text-xs text-slate-400">
                  {totalAgents === 0
                    ? "Aún no has creado ningún agente."
                    : "Todos tus agentes están listos en WooCommerce."}
                </p>
              </article>

              <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-lg shadow-slate-900/40 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Agentes activos
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {activeAgents}
                </p>
                <p className="text-xs text-slate-400">
                  {activeAgents === totalAgents
                    ? "Todos tus agentes están activos."
                    : "Activa los agentes que necesites desde su ficha."}
                </p>
              </article>

              <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-lg shadow-slate-900/40 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Límite de mensajes
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {planLimitLabel}
                </p>
                <p className="text-xs text-slate-400">
                  Controla tus mensajes desde los reportes semanales.
                </p>
              </article>
            </div>

            <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Tus agentes
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Gestiona las integraciones, copia las API keys y revisa el límite
                    de mensajes de cada agente.
                  </p>
                </div>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  Ver agentes
                </Link>
              </div>

              {totalAgents === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-300">
                  <p className="font-medium text-white">
                    Todavía no tienes agentes configurados.
                  </p>
                  <p className="mt-2">
                    Crea tu primer agente para conectar WooCommerce y empezar a
                    responder chats automáticamente.
                  </p>
                  <Link
                    href="/agents"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Crear agente
                  </Link>
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {agents?.slice(0, 5).map((agent) => {
                    const statusColor = agent.is_active
                      ? "bg-emerald-400"
                      : "bg-slate-500";
                    const statusText = agent.is_active ? "Activo" : "Pausado";
                    return (
                      <li
                        key={agent.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                            <span className="text-base font-semibold text-white">
                              {agent.name}
                            </span>
                            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                              {statusText}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            API Key:{" "}
                            <span className="font-mono text-slate-200">
                              {agent.api_key?.slice(0, 6) ?? "N/A"}••••••
                            </span>
                          </p>
                          <p className="text-xs text-slate-400">
                            Límite de mensajes: {agent.messages_limit ?? 1000}
                          </p>
                        </div>
                        <Link
                          href={`/agents/${agent.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                        >
                          Configurar
                        </Link>
                      </li>
                    );
                  })}
                  {totalAgents > 5 && (
                    <li className="text-center text-xs text-slate-400">
                      Mostramos tus 5 agentes más recientes. Consulta el listado
                      completo en la sección de agentes.
                    </li>
                  )}
                </ul>
              )}
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">
                Snippet de incrustación
              </h3>
              <p className="mt-2 text-xs text-slate-300">
                Pega este script en el footer de tu WordPress o en un widget HTML.
                Reemplaza{" "}
                <code className="rounded bg-slate-800 px-1 py-0.5">
                  AGENT_API_KEY
                </code>{" "}
                con la clave del agente que quieras mostrar.
              </p>
              <pre className="mt-4 max-h-60 overflow-auto rounded-2xl bg-slate-950/80 p-4 text-[11px] leading-relaxed text-emerald-200">
{`<script>
  (function () {
    var s = document.createElement('script');
    s.src = 'https://tu-dominio.com/api/widget?key=AGENT_API_KEY';
    s.defer = true;
    s.onerror = function(){ console.error("[AI SaaS] No se pudo cargar el widget."); };
    document.head.appendChild(s);
  })();
</script>`}
              </pre>
              <p className="mt-3 text-xs text-slate-400">
                El widget valida tu plan y límite en el backend antes de mostrar el chat.
              </p>
            </article>

            <article className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-100 shadow-lg shadow-emerald-500/20 backdrop-blur">
              <h3 className="text-lg font-semibold">Plan y facturación</h3>
              <p className="mt-2 text-sm">
                Mantén tu plan al día para seguir enviando mensajes sin interrupciones.
                Actualiza tu suscripción cuando lo necesites.
              </p>
              <Link
                href="/billing"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Gestionar suscripción
              </Link>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
