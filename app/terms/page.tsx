export default function TermsPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Documentación legal
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Términos y condiciones</h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Este acuerdo define cómo las agencias utilizan AI SaaS, qué responsabilidades
            asumimos y los límites de servicio que aplican a cada plan.
          </p>
        </header>

        <article className="mt-12 space-y-6 text-sm text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">1. Uso autorizado</h2>
            <p>
              La cuenta está destinada a gestionar agentes AI para tiendas online de tus
              clientes. Está prohibido usar la plataforma para actividades ilegales,
              envío masivo de spam o cualquier acción que comprometa infraestructuras
              externas.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">2. Límites del servicio</h2>
            <p>
              Cada plan incluye un volumen de mensajes y número de agentes activos.
              Superar esos límites puede suspender temporalmente el servicio hasta
              actualizar el plan o adquirir volumen adicional.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">3. Soporte y SLA</h2>
            <p>
              Ofrecemos soporte prioritario a través del panel. Las incidencias críticas
              se atienden en menos de 12 horas hábiles. Si necesitas un acuerdo SLA
              personalizado, contáctanos para formalizarlo.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
