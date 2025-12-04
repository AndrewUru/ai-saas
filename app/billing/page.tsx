import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

type PlanCard = {
  id: string;
  name: string;
  price: string;
  cycle: string;
  limit: string;
  blurb: string;
  features: string[];
};

const PLAN_CARDS: PlanCard[] = [
  {
    id: "free",
    name: "Plan Free",
    price: "$0",
    cycle: "por mes",
    limit: "Hasta 1,000 mensajes/mes",
    blurb: "Ideal para probar el panel y activar tu primer agente.",
    features: [
      "1 agente activo con widget embebible",
      "Validacion de dominios permitidos",
      "Prompts y branding personalizables",
      "Soporte por email con SLA basico",
    ],
  },
  {
    id: "basic",
    name: "Plan Basic",
    price: "$29",
    cycle: "por mes",
    limit: "Hasta 2,000 mensajes/mes",
    blurb: "Para agencias que lanzan agentes en mas de una tienda.",
    features: [
      "Hasta 5 agentes en paralelo",
      "Integracion WooCommerce prioritaria",
      "Alertas cuando se acerque el limite",
      "Reportes mensuales de uso",
    ],
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: "$79",
    cycle: "por mes",
    limit: "Hasta 10,000 mensajes/mes",
    blurb: "Para operaciones 24/7 con volumen alto y escalamientos.",
    features: [
      "Hasta 15 agentes dedicados",
      "Webhook y suscripciones PayPal",
      "Rutas de escalamiento personalizadas",
      "Acompanamiento de onboarding",
    ],
  },
];

export default async function BillingPage() {
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

  const activePlan = (profile?.plan ?? "free").toLowerCase();
  const activeUntil = profile?.active_until
    ? new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(profile.active_until))
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 md:px-10 lg:px-16">
        <header className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Facturacion
          </p>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Gestiona tu plan y limites
              </h1>
              <p className="text-sm text-slate-300 sm:text-base">
                Revisa tu plan activo, fecha de vigencia y opciones para escalar
                cuando aumente el volumen de mensajes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                Plan actual
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {activePlan.toUpperCase()}
              </p>
              <p className="text-xs text-slate-500">
                {activeUntil
                  ? `Vigente hasta ${activeUntil}`
                  : "Sin fecha activa registrada"}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLAN_CARDS.map((plan) => {
            const isActive = plan.id === activePlan;
            return (
              <article
                key={plan.id}
                className={`flex h-full flex-col rounded-3xl border p-6 shadow-lg backdrop-blur ${
                  isActive
                    ? "border-emerald-400/50 bg-emerald-500/5 shadow-emerald-500/20"
                    : "border-slate-800/60 bg-slate-900/60 shadow-slate-900/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {plan.limit}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {plan.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      {plan.blurb}
                    </p>
                  </div>
                  {isActive && (
                    <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      Activo
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-emerald-300">
                    {plan.price}
                  </span>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    {plan.cycle}
                  </span>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-slate-200">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2"
                    >
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {isActive ? (
                    <button
                      disabled
                      className="w-full rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-inner shadow-emerald-500/20"
                    >
                      Plan activo
                    </button>
                  ) : (
                    <Link
                      href="/contact"
                      className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                      Hablar para actualizar
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">
            Necesitas una factura o tienes dudas?
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Podemos ayudarte a ajustar tu plan, emitir facturas personalizadas
            o configurar una suscripcion recurrente.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:billing@ai-saas.test"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
            >
              Escribir a soporte de facturacion
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:text-emerald-200"
            >
              Volver al panel
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
