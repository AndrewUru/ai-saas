export function Hero() {
  const signals = [
    { label: "Top objection", value: "Shipping cost" },
    { label: "Training gap", value: "Return policy" },
    { label: "Next action", value: "Create FAQ" },
  ];

  return (
    <header className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent-secondary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:px-8">
        <div className="max-w-4xl space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Commerce Copilot for WooCommerce and Shopify
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Find what is blocking sales.
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/45">
                Then fix it with AI.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl lg:mx-0">
              AI Commerce Agents answers shoppers, detects objections, suggests
              training improvements, and turns support conversations into
              revenue actions for every store you manage.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-4 pt-2 sm:w-auto sm:flex-row lg:items-start">
            <a
              href="/dashboard"
              className="w-full rounded-xl bg-white px-8 py-4 text-center font-semibold text-black transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              Open copilot
            </a>
            <a
              href="/pricing"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-center font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
            >
              View plans
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Live insight board
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Demo store: Nordia Beauty
              </p>
            </div>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
              3 actions
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {signals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {signal.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {signal.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-semibold text-emerald-100">
              Suggested improvement
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/75">
              Add an approved answer for shipping thresholds and recommend free
              shipping bundles when carts are close to the limit.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
