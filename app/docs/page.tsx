export default function DocsPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Documentacion
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Guia tecnica para desplegar agentes en proyectos ecommerce
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Encuentra endpoints, esquemas de base de datos y ejemplos de
            integracion para conectar AI SaaS con los sistemas de tus clientes.
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Empezar con la API
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Consulta la referencia REST y ejemplos de autenticacion con
              Supabase para validar agentes, enviar mensajes y sincronizar
              inventario.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Widgets y componentes
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Aprende a personalizar el widget, agregar eventos de analytics y
              disparar flujos de marketing automation desde el chat.
            </p>
          </article>
        </div>

        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-white">
            Necesitas algo especifico?
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Escribenos a soporte para recibir ejemplos personalizados o una
            sesion tecnica junto a tu equipo de desarrollo.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Contactar soporte tecnico
          </a>
        </div>
      </section>
    </main>
  );
}
