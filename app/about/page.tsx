export default function AboutPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Sobre nosotros
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Potenciamos a las agencias que crean ecommerce memorables
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            AI SaaS nacio tras acompanar a estudios web que necesitaban escalar
            soporte sin perder el tono de cada marca. Construimos la plataforma
            para que tu equipo despliegue agentes confiables, mida resultados y
            ofrezca un servicio recurrente a sus clientes.
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">
              Nuestro manifiesto
            </h2>
            <p className="text-sm text-slate-300">
              Creemos que la automatizacion debe reforzar la relacion entre
              agencia y marca, no reemplazarla. Por eso priorizamos controles
              granulares, analitica transparente y un onboarding que tu equipo
              puede replicar en horas.
            </p>
          </article>
          <article className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">Lo que sigue</h2>
            <p className="text-sm text-slate-300">
              Estamos ampliando integraciones con CRMs y plataformas de pagos,
              ademas de un marketplace de prompts verificados por agencias para
              acelerar cada nuevo proyecto ecommerce.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
