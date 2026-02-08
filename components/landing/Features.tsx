export function Features() {
  const features = [
    {
      title: "Native WooCommerce integration",
      body: "Sync catalogs, inventory, and orders for each store in seconds so the agent responds with live data.",
      icon: (
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          data-oid="7ox3rel"
        />
      ),
    },
    {
      title: "Agency-ready templates",
      body: "Clone prompt libraries and approved flows to speed up every new client without starting from scratch.",
      icon: (
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
          data-oid="nwurzx-"
        />
      ),
    },
    {
      title: "Per-client brand control",
      body: "Configure tone, pull in brand guides, and define specific escalation paths for each brand.",
      icon: (
        <path
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM7 12l3 3 7-7"
          data-oid="gvscrpx"
        />
      ),
    },
    {
      title: "Multichannel widgets",
      body: "Embed chat in WordPress, Shopify, or custom frontends with a single script and fully branded styles.",
      icon: (
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          data-oid="xzkar7l"
        />
      ),
    },
    {
      title: "Real-time analytics",
      body: "Track conversions, deflected tickets, and opportunities per client in a shared dashboard.",
      icon: <path d="M18 20V10M12 20V4M6 20v-6" data-oid="35p4czt" />,
    },
    {
      title: "Managed billing",
      body: "Connect PayPal or cards to charge recurring services and automatically enforce plan limits.",
      icon: (
        <path
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z"
          data-oid="9i5z4s7"
        />
      ),
    },
  ];

  return (
    <section
      className="relative bg-[#030303] py-24 sm:py-32"
      data-oid="ztqmyfl"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8" data-oid="8og0r44">
        {/* Header con estilo minimalista */}
        <div className="max-w-3xl" data-oid="_pgiim0">
          <h2
            className="text-base font-semibold leading-7 text-accent uppercase tracking-[0.2em]"
            data-oid="4.i_epj"
          >
            Agency Infrastructure
          </h2>
          <p
            className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl"
            data-oid="ojvb.33"
          >
            Everything you need to launch{" "}
            <span className="text-zinc-500" data-oid="hq.c_3g">
              profitable agents.
            </span>
          </p>
          <p
            className="mt-6 text-lg leading-8 text-zinc-400"
            data-oid="rr13:lk"
          >
            From catalogs to automated billing, our platform centralizes the
            entire lifecycle of ecommerce AI.
          </p>
        </div>

        {/* Grid Estilo "Bento High-Tech" */}
        <div
          className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-oid="zc61z61"
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10"
              data-oid="7ryyh6m"
            >
              {/* Efecto de luz radial al hacer hover */}
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.06),transparent_40%)]"
                data-oid="__ruzsd"
              />

              <div data-oid="lyp0mhh">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white group-hover:text-accent group-hover:border-accent/30 transition-colors"
                  data-oid="3mmdzk-"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    data-oid="tufdwqg"
                  >
                    {feature.icon}
                  </svg>
                </div>

                <h3
                  className="mt-6 text-lg font-semibold leading-7 text-white group-hover:text-accent transition-colors"
                  data-oid="jf29je:"
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-6 text-zinc-400 group-hover:text-zinc-300 transition-colors"
                  data-oid="yez17.l"
                >
                  {feature.body}
                </p>
              </div>

              {/* Decoración sutil de esquina */}
              <div
                className="mt-6 flex items-center gap-x-2 text-xs font-medium text-zinc-500 group-hover:text-white transition-colors"
                data-oid="hrigqk4"
              >
                <span data-oid="s7edoua">Learn more</span>
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-oid="x:yqo.."
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                    data-oid="d.7ucnd"
                  />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Separador inferior sutil */}
      <div
        className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
        data-oid="45gdhm_"
      />
    </section>
  );
}
