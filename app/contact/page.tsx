export default function ContactPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Soporte a agencias
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Hablemos de tu implementación
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Escríbenos para resolver dudas técnicas, preparar demos para tus clientes o
            solicitar un plan empresarial.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="space-y-3 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Correo</h2>
            <p className="text-sm text-slate-300">
              Envía tus consultas a{" "}
              <a
                href="mailto:hola@ai-saas.agency"
                className="text-emerald-300 hover:text-emerald-200"
              >
                hola@ai-saas.agency
              </a>{" "}
              indicando la tienda y el número de agentes que necesitas.
            </p>
          </article>

          <article className="space-y-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-100 shadow-lg shadow-emerald-500/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">
              Agenda una sesión
            </h2>
            <p className="text-sm">
              Coordinamos workshops de integración y auditoría de prompts con tu
              equipo. Solicítalo desde el panel o vía correo.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
