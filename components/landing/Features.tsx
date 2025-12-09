export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
      <div className="text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Everything your agency needs to launch profitable agents
        </h2>
        <p className="mt-4 text-base text-slate-300 sm:text-lg">
          From collecting catalogs and policies to validating payments, our
          platform centralizes the design, deployment, and measurement of
          ecommerce agents.
        </p>
      </div>
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Native WooCommerce integration",
            body: "Sync catalogs, inventory, and orders for each store in seconds so the agent responds with live data.",
          },
          {
            title: "Agency-ready templates",
            body: "Clone prompt libraries and approved flows to speed up every new client without starting from scratch.",
          },
          {
            title: "Per-client brand control",
            body: "Configure tone, pull in brand guides, and define specific escalation paths for each brand.",
          },
          {
            title: "Multichannel widgets",
            body: "Embed chat in WordPress, Shopify, or custom frontends with a single script and fully branded styles.",
          },
          {
            title: "Real-time analytics",
            body: "Track conversions, deflected tickets, and opportunities per client in a shared dashboard.",
          },
          {
            title: "Managed billing",
            body: "Connect PayPal or cards to charge recurring services and automatically enforce plan limits.",
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
  );
}
