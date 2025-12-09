export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Everything your agency needs to launch{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-secondary animate-gradient-x">
            profitable agents
          </span>
        </h2>
        <p className="mt-6 text-lg text-[var(--foreground-muted)] leading-relaxed">
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
            className="group ui-card relative overflow-hidden flex flex-col p-8 backdrop-blur-md bg-surface/30 hover:bg-surface/50 hover:-translate-y-1 hover:border-accent/40 shadow-soft hover:shadow-glow transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="mt-4 text-base text-[var(--foreground-muted)] leading-relaxed group-hover:text-[var(--foreground)] transition-colors duration-300">
              {feature.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
