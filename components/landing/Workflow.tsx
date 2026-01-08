export function Workflow() {
  return (
    <section className="relative overflow-hidden bg-[#030303] py-24 sm:py-32">
      {/* Elemento decorativo de fondo: Línea de luz vertical */}
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Columna Izquierda: Información y Trust Points */}
          <div className="space-y-10">
            <div>
              <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-accent">
                Developer First
              </h2>
              <h3 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Built for your agency&apos;s{" "}
                <span className="text-zinc-500">workflow.</span>
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                Our API-first architecture makes it easy to extend each agent
                with the tools you already use. Connect CRMs and fulfillment
                without compromising security.
              </p>
            </div>

            <ul className="space-y-6">
              {[
                {
                  label: "Security",
                  text: "Supabase server-side auth keeps every request scoped.",
                },
                {
                  label: "Webhooks",
                  text: "Alert your stack when leads or VIPs need human follow-up.",
                },
                {
                  label: "Permissions",
                  text: "Granular access for clients without exposing credentials.",
                },
              ].map((item) => (
                <li key={item.label} className="group flex items-start gap-4">
                  <div className="mt-1.5 h-1 w-6 rounded-full bg-zinc-800 transition-all group-hover:w-8 group-hover:bg-accent" />
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    <strong className="text-white font-medium">
                      {item.label}:
                    </strong>{" "}
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <a
                href="/docs"
                className="group flex items-center gap-2 text-sm font-semibold text-white"
              >
                View technical docs
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Estilo "Glass Console" */}
          <div className="relative">
            {/* Glow de fondo para la tarjeta */}
            <div className="absolute -inset-4 rounded-[2rem] bg-accent/5 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent">
                  Deployment Process
                </h3>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                </div>
              </div>

              <ol className="relative space-y-8">
                {/* Línea conectora entre números */}
                <div className="absolute left-[19px] top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-accent/50 via-zinc-800 to-transparent" />

                {[
                  {
                    title: "Create the agent",
                    detail: "Describe voice and upload FAQs.",
                  },
                  {
                    title: "Connect data",
                    detail: "Secure tokens for WooCommerce.",
                  },
                  {
                    title: "Embed widget",
                    detail: "One script, instant results.",
                  },
                  {
                    title: "Monitor",
                    detail: "Tweak and scale from dashboard.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="relative flex gap-6">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#030303] text-sm font-bold text-white shadow-xl group-hover:border-accent/50 transition-colors">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-sm text-zinc-500">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Botón de acción dentro de la "consola" */}
              <button className="mt-10 w-full rounded-xl bg-white py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Start Integration
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
