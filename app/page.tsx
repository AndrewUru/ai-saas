// app/page.tsx
export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-10 px-6 py-24 sm:px-10 lg:px-16">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Agentes IA para agencias ecommerce
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Implementa agentes de IA para las tiendas online de tus clientes
            </h1>
            <p className="text-lg text-slate-200 sm:text-xl">
              Escala un servicio recurrente ofreciendo asistentes entrenados que
              siguen las politicas de cada marca, consultan WooCommerce y
              aumentan las ventas sin ampliar el equipo de soporte.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/dashboard"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Entrar al panel
              </a>
              <a
                href="/login"
                className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
              >
                Iniciar prueba gratuita
              </a>
            </div>
          </div>
          <dl className="grid gap-6 sm:grid-cols-3">
            {[
              {
                label: "Consultas gestionadas",
                value: "40k+",
              },
              {
                label: "Tiendas WooCommerce atendidas",
                value: "1,200+",
              },
              {
                label: "Integraciones y automatizaciones",
                value: "30+",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-emerald-500/5"
              >
                <dt className="text-sm uppercase tracking-wide text-slate-400">
                  {item.label}
                </dt>
                <dd className="mt-2 text-3xl font-semibold text-emerald-300">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Todo lo que tu agencia necesita para lanzar agentes rentables
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Desde la recopilacion de catalogos y politicas hasta la validacion
            de pagos, nuestra plataforma centraliza el diseno, despliegue y
            medicion de agentes para ecommerce.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Integracion nativa con WooCommerce",
              body: "Sincroniza catalogos, stock y pedidos para cada tienda en segundos; el agente responde con datos reales.",
            },
            {
              title: "Plantillas listas para agencias",
              body: "Duplica librerias de prompts y flujos aprobados para acelerar cada nuevo cliente sin empezar desde cero.",
            },
            {
              title: "Control de marca por cliente",
              body: "Configura tono, recupera guias y define rutas de escalamiento especificas para cada marca.",
            },
            {
              title: "Widgets multicanal",
              body: "Integra el chat en WordPress, Shopify o frontends personalizados con un unico script y estilos propios.",
            },
            {
              title: "Analitica en tiempo real",
              body: "Visualiza conversiones, tickets ahorrados y oportunidades por cliente en un panel compartido.",
            },
            {
              title: "Facturacion administrada",
              body: "Conecta PayPal o tarjetas para cobrar servicios recurrentes y aplicar limites por plan automaticamente.",
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-900/40"
            >
              <h3 className="text-lg font-semibold text-emerald-300">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-slate-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-900 bg-slate-950/70">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Pensado para el flujo de trabajo de tu agencia
            </h2>
            <p className="text-base text-slate-300 sm:text-lg">
              Nuestra arquitectura API first facilita extender cada agente con
              las herramientas que ya usas. Conecta CRMs, automatizaciones o
              sistemas de fulfillment sin comprometer seguridad.
            </p>
            <ul className="space-y-4 text-sm text-slate-200">
              {[
                "La autenticacion server side de Supabase mantiene cada solicitud dentro del workspace de tu agencia.",
                "Webhooks alertan a tu stack cuando leads, devoluciones o clientes VIP requieren seguimiento humano.",
                "Los permisos granulares comparten analiticas con clientes y equipo sin exponer credenciales.",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />

                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <a
                href="/docs"
                className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
              >
                Ver documentación técnica
              </a>
              <a
                href="/contact"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Hablar con ventas
              </a>
            </div>
          </div>
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl shadow-emerald-500/10">
            <h3 className="text-xl font-semibold text-emerald-300">
              Como funciona
            </h3>
            <ol className="space-y-4 text-sm text-slate-200">
              {[
                {
                  title: "Crea el agente",
                  detail:
                    "Describe la voz de la marca, sube FAQs y define rutas de escalamiento en minutos.",
                },
                {
                  title: "Conecta fuentes de datos",
                  detail:
                    "Autoriza WooCommerce, bases de conocimiento y pasarelas de pago con tokens seguros.",
                },
                {
                  title: "Incrusta el widget",
                  detail:
                    "Copia el script en el footer de la tienda y atiende clientes al instante.",
                },
                {
                  title: "Monitorea resultados",
                  detail:
                    "Revisa analiticas, ajusta prompts y escala conversaciones directamente desde el panel.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400 bg-slate-900 text-base font-semibold text-emerald-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{step.title}</p>
                    <p className="mt-1 text-slate-300">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Agencias y marcas digitales que confian
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Equipos en retail, suscripciones y DTC confian en nuestros agentes
              para mantener soporte 24/7 y cuidar cada voz de marca.
            </p>
          </div>
          <div className="space-y-6 lg:col-span-2">
            {[
              {
                quote:
                  "Reemplazamos un turno completo de soporte y ahora resolvemos 82 por ciento de los tickets automaticamente. Nuestros clientes notan la respuesta inmediata.",
                author: "Lucia Torres",
                role: "Directora de CX, Nordia Beauty",
              },
              {
                quote:
                  "Integrar WooCommerce tomo menos de cinco minutos. Ver pedidos reales en el chat nos permite proponer ventas adicionales antes que la competencia.",
                author: "Victor Ramirez",
                role: "Fundador, Casa Moda Store",
              },
              {
                quote:
                  "La analitica nos muestra que prompts convierten mejor y cuando involucrar a una persona. Es como tener un aliado que no duerme.",
                author: "Ana Walker",
                role: "COO, Sunwave Gear",
              },
            ].map((testimonial) => (
              <figure
                key={testimonial.author}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-900/40"
              >
                <blockquote className="text-lg text-slate-200">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm text-slate-400">
                  <span className="font-semibold text-white">
                    {testimonial.author}
                  </span>{" "}
                  &mdash; {testimonial.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-900 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-center sm:px-10 lg:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Listo para escalar
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Lanza tu primer agente para un cliente hoy
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
            Crea una cuenta, conecta la tienda WooCommerce de tu cliente y
            entrega una experiencia de soporte completa en menos de una hora.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Crear cuenta gratuita
            </a>
            <a
              href="/billing"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
            >
              Ver planes
            </a>
          </div>
          <p className="text-xs text-slate-500">
            Sin tarjeta requerida. Mejora tu plan solo cuando aumente el
            volumen.
          </p>
        </div>
      </section>
    </main>
  );
}
