export default function PrivacyPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Documentación legal
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Política de privacidad
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Resumimos cómo recopilamos, utilizamos y protegemos los datos que
            nos confían agencias y clientes de ecommerce. Este documento se
            actualiza a medida que añadimos nuevas funcionalidades a la
            plataforma.
          </p>
        </header>

        <article className="mt-12 space-y-6 text-sm text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Datos que guardamos
            </h2>
            <p>
              Solo almacenamos la información necesaria para operar los agentes:
              credenciales cifradas de servicios externos, datos de facturación
              y los mensajes intercambiados con los clientes finales. No
              compartimos estos datos con terceros ajenos a la agencia
              propietaria de la cuenta.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Procesamiento de datos
            </h2>
            <p>
              El acceso a la información sensible se limita a procesos
              automatizados del sistema. Todo refuerzo manual (soporte técnico o
              auditorías) requiere autorización escrita por parte de la agencia
              y queda registrado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Retención y eliminación
            </h2>
            <p>
              Puedes solicitar la eliminación total de datos en cualquier
              momento. Conservamos los registros durante 30 días después de la
              baja para cumplir obligaciones contables y responder a
              incidencias.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
