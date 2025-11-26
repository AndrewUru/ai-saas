import Link from "next/link";
import { redirect } from "next/navigation";
import AgentsSection from "./AgentsSection";
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
              Gestiona tus agentes, revisa el estado de tu plan y comparte el
              widget con tus tiendas desde un solo lugar.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-300 md:text-right">
            <div>
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                Plan activo
              </span>
              <div className="text-lg font-semibold text-white">
                {planLabel}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                Vigente hasta
              </span>
              <div className="text-lg font-semibold text-white">
                {activeUntil}
              </div>
            </div>
          </div>
        </header>

        <div
          className="
  grid gap-8
  lg:grid-cols-[minmax(0,1.3fr)_320px]
  xl:grid-cols-[minmax(0,1.6fr)_360px]
  2xl:grid-cols-[minmax(0,2fr)_420px]
  w-full
"
        >
          <div className="w-full">
            <AgentsSection planLimitLabel={planLimitLabel} />
          </div>

          <aside className="space-y-6 w-full">
            <article className="ui-card ui-card--padded ui-card--strong text-emerald-100">
              <h3 className="text-lg font-semibold">Plan y facturación</h3>
              <p className="mt-2 text-sm">
                Mantén tu plan al día para seguir enviando mensajes sin
                interrupciones. Actualiza tu suscripción cuando lo necesites.
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
