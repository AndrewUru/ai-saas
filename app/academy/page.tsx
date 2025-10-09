export default function AcademyPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Academia para agencias
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Certifica a tu equipo en la implementacion de agentes ecommerce
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Accede a sesiones en vivo, playbooks descargables y librerias de
            prompts listas para replicar en clientes con WooCommerce, Shopify o
            headless storefronts.
          </p>
        </header>

        <div className="mt-16 space-y-8">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Programa de onboarding express
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Cuatro modulos auto gestionados que cubren discovery comercial,
              configuracion tecnica, lanzamiento del widget y seguimiento de
              resultados con clientes reales.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Laboratorios mensuales
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Encuentros en vivo para revisar casos de uso, optimizar prompts y
              compartir automatizaciones entre agencias certificadas.
            </p>
          </article>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Proximamente
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Estamos habilitando evaluaciones para certificar consultores
              senior y un repositorio de casos de exito que podras compartir con
              clientes potenciales.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
