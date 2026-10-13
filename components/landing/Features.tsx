import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  Gauge,
  MessagesSquare,
  PackageSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const frictionSignals = [
  { label: "Delivery cost", value: 78, color: "bg-amber-300" },
  { label: "Product fit", value: 61, color: "bg-violet-300" },
  { label: "Return policy", value: 42, color: "bg-sky-300" },
] as const;

const approvalQueue = [
  "Add shipping threshold answer",
  "Recommend an in-stock alternative",
  "Escalate refund requests",
] as const;

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#080808] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-64 w-[44rem] -translate-x-1/2 rounded-full bg-violet-500/8 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              One continuous loop
            </span>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">
              The widget is only the surface.
            </h2>
          </div>
          <p className="max-w-2xl text-pretty text-lg leading-8 text-zinc-400 lg:justify-self-end">
            Every conversation enriches a shared operating system for commerce:
            better recommendations for shoppers, clearer signals for teams, and
            improvements that stay under human control.
          </p>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-12">
          <article className="group relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#efe9df] p-6 text-zinc-900 sm:p-8 lg:col-span-7 lg:min-h-[520px]">
            <div className="absolute right-[-12%] top-[-22%] h-80 w-80 rounded-full bg-[#d5c5ae] blur-[2px]" />
            <div className="relative flex items-start justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-black/6 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                  <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Sell
                </span>
                <h3 className="mt-5 max-w-lg text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Recommendations grounded in the live catalog.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Match intent with price, stock, variants, policies, and useful
                  alternatives instead of sending generic replies.
                </p>
              </div>
              <ArrowUpRight
                className="h-6 w-6 shrink-0 text-zinc-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>

            <div className="relative mt-10 grid gap-3 sm:grid-cols-[.82fr_1.18fr]">
              <div className="rounded-[1.5rem] bg-[#28231f] p-5 text-white shadow-2xl">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Shopper intent
                </span>
                <p className="mt-8 text-xl font-medium leading-7">
                  “I need a fragrance-free routine under $80.”
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {["Sensitive skin", "Budget $80", "Ready to buy"].map(
                    (signal) => (
                      <span
                        key={signal}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] text-zinc-300"
                      >
                        {signal}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    Best match
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    In stock
                  </span>
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#c8b8a4]">
                    <div className="h-20 w-10 rounded-[1.2rem_1.2rem_.5rem_.5rem] bg-[#f4efe8] shadow-lg" />
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="text-sm font-semibold">Calm skin set</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Fragrance-free · 3 products
                    </p>
                    <p className="mt-4 text-lg font-semibold">$68</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-black px-3 py-2.5 text-xs font-semibold text-white">
                  Recommend bundle
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101012] p-6 sm:p-8 lg:col-span-5 lg:min-h-[520px]">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[90px]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
                Learn
              </span>
              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                See why shoppers hesitate.
              </h3>
              <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
                Group real conversations into patterns your team can understand
                and act on.
              </p>

              <div className="mt-10 rounded-[1.5rem] border border-white/8 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Friction map
                  </span>
                  <span className="text-[10px] text-zinc-500">Last 30 days</span>
                </div>
                <div className="mt-7 space-y-6">
                  {frictionSignals.map((signal) => (
                    <div key={signal.label}>
                      <div className="mb-2 flex justify-between text-[11px]">
                        <span className="text-zinc-300">{signal.label}</span>
                        <span className="font-semibold text-white">
                          {signal.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${signal.color}`}
                          style={{ width: `${signal.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] p-6 sm:p-8 lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Control
            </span>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
              AI proposes. Your team approves.
            </h3>
            <div className="mt-8 space-y-2">
              {approvalQueue.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      index === 0
                        ? "bg-emerald-400 text-emerald-950"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {index === 0 ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <span className="text-[10px]">{index + 1}</span>
                    )}
                  </span>
                  <span className="text-xs text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/15 via-[#111] to-[#111] p-6 sm:p-8 lg:col-span-7">
            <div className="grid h-full gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                  <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                  Operate
                </span>
                <h3 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-white">
                  One cockpit for every store you manage.
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">
                  Keep each brand, catalog, prompt, and handoff policy separate
                  while sharing the workflows that already work.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:w-56">
                {[
                  [MessagesSquare, "Conversations"],
                  [PackageSearch, "Catalog"],
                  [BrainCircuit, "Training"],
                  [ShieldCheck, "Handoffs"],
                ].map(([Icon, label]) => {
                  const CardIcon = Icon as typeof MessagesSquare;
                  return (
                    <div
                      key={label as string}
                      className="flex aspect-square flex-col justify-between rounded-2xl border border-white/8 bg-black/25 p-3"
                    >
                      <CardIcon className="h-4 w-4 text-zinc-300" aria-hidden="true" />
                      <span className="text-[9px] font-medium text-zinc-500">
                        {label as string}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
