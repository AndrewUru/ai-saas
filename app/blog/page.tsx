export default function BlogPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Blog para agencias
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Ideas para escalar servicios recurrentes en ecommerce
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Historias, experimentos y tacticas compartidas por agencias que ya
            venden agentes de IA como parte de su oferta.
          </p>
        </header>

        <div className="mt-16 space-y-8">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Destacado
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Como convertir implementaciones en retainer mensual
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Modelos de precio, contratos y reportes que agencias usan para
              fidelizar clientes de tiendas online con agentes siempre activos.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">
              Recursos en camino
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Estamos preparando entrevistas con directores de CX, guias sobre
              prompts de venta cruzada y plantillas de propuestas comerciales.
              Suscribete para recibirlos primero.
            </p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="tuemail@agencia.com"
                className="w-full rounded-full border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />

              <button
                type="submit"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Avisame
              </button>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
