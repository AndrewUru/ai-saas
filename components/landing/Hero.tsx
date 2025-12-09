export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-10 px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            AI agents for ecommerce agencies
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Deploy AI agents for your clients&apos; online stores
          </h1>
          <p className="text-lg text-slate-200 sm:text-xl">
            Scale a recurring service by offering trained assistants that follow
            each brand&apos;s policies, query WooCommerce, and boost sales
            without growing your support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/dashboard"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Go to dashboard
            </a>
            <a
              href="/login"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
            >
              Start free trial
            </a>
          </div>
        </div>
        <dl className="grid gap-6 sm:grid-cols-3">
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
  );
}
