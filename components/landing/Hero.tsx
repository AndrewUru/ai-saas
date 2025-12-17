export function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-accent/20 blur-[120px] rounded-full pointer-events-none opacity-40 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background z-0 pointer-events-none" />

      <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center gap-12 px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            AI agents for ecommerce agencies
          </div>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl text-foreground">
            Deploy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-accent-secondary animate-gradient-x">
              AI agents
            </span>{" "}
            for your clients&apos; online stores
          </h1>
          <p className="max-w-2xl text-lg text-[var(--foreground-muted)] sm:text-xl leading-relaxed">
            Scale a recurring service by offering trained assistants that follow
            each brand&apos;s policies, query WooCommerce, and boost sales
            without growing your support team.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/dashboard"
              className="ui-button ui-button--primary text-lg px-8 py-4 shadow-[0_4px_20px_rgba(52,211,153,0.3)] hover:shadow-[0_6px_25px_rgba(52,211,153,0.4)]"
            >
              Go to dashboard
            </a>
            <a
              href="/login"
              className="ui-button ui-button--ghost text-lg px-8 py-4"
            >
              Start free trial
            </a>
          </div>
        </div>

        <dl className="grid gap-6 sm:grid-cols-3 pt-8">
          {[
            {
              label: "Conversations handled",
              value: "40k+",
            },
            {
              label: "WooCommerce stores served",
              value: "1,200+",
            },
            {
              label: "Integrations & automations",
              value: "30+",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="group ui-card flex flex-col p-8 backdrop-blur-xl bg-surface/40 hover:bg-surface/60 hover:-translate-y-1 hover:border-accent/30 transition-all duration-300"
            >
              <dt className="text-sm font-medium uppercase tracking-wider text-[var(--foreground-muted)] group-hover:text-foreground transition-colors">
                {item.label}
              </dt>
              <dd className="mt-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 group-hover:from-accent group-hover:to-accent-strong transition-all duration-300">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
