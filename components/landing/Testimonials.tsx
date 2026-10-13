import { ArrowUpRight, Headphones, Layers3, Store } from "lucide-react";

const useCases = [
  {
    icon: Store,
    number: "01",
    title: "Commerce teams",
    description:
      "Guide product discovery, answer buying questions, and surface the friction hiding between product view and checkout.",
    outcomes: ["Product discovery", "Policy answers", "Bundle guidance"],
    accent: "from-amber-300/18",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Digital agencies",
    description:
      "Operate multiple branded agents from one workflow while keeping every client's data, tone, and approvals separate.",
    outcomes: ["Reusable playbooks", "Client reporting", "Brand control"],
    accent: "from-violet-400/18",
  },
  {
    icon: Headphones,
    number: "03",
    title: "Customer experience",
    description:
      "Resolve repetitive questions instantly and hand complex cases to people with intent, history, and product context attached.",
    outcomes: ["Smart handoff", "Conversation context", "Training queue"],
    accent: "from-sky-300/18",
  },
] as const;

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#080808] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Built around the work
            </span>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">
              One agent. Different operating modes.
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-zinc-400 lg:justify-self-end">
            Start with the workflow your team needs today. Keep the same
            conversation intelligence as the operation grows.
          </p>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;

            return (
              <article
                key={useCase.title}
                className={`group relative isolate min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${useCase.accent} via-[#111]/70 to-[#0b0b0b] p-6 sm:p-8`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-zinc-700">
                    {useCase.number}
                  </span>
                </div>

                <div className="mt-16">
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                    {useCase.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {useCase.description}
                  </p>
                </div>

                <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                  <div className="flex flex-wrap gap-2">
                    {useCase.outcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-[10px] font-medium text-zinc-400"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5 text-xs font-semibold text-zinc-500 transition-colors group-hover:text-white">
                    Explore the workflow
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-5 rounded-[1.5rem] border border-white/8 bg-white/[0.02] px-6 py-5 sm:flex-row">
          <p className="text-sm text-zinc-400">
            Connect the commerce stack you already use.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <span>WooCommerce</span>
            <span>Shopify</span>
            <span>Any website</span>
            <span>Supabase</span>
          </div>
        </div>
      </div>
    </section>
  );
}
