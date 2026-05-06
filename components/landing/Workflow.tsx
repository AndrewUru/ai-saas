const steps = [
  {
    title: "Connect the catalog",
    detail: "Sync WooCommerce or Shopify products so every answer has store context.",
  },
  {
    title: "Pick a playbook",
    detail: "Start from a vertical-specific flow for fashion, beauty, electronics, or subscriptions.",
  },
  {
    title: "Simulate edge cases",
    detail: "Test refunds, stock issues, delivery objections, and product recommendations before launch.",
  },
  {
    title: "Approve improvements",
    detail: "Review suggested FAQs, prompt rules, and handoff triggers from real conversations.",
  },
];

export function Workflow() {
  return (
    <section className="relative overflow-hidden bg-[#030303] py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-10">
            <div>
              <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-accent">
                Operating system
              </h2>
              <h3 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Run every client store through{" "}
                <span className="text-zinc-500">one improvement loop.</span>
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                Launch the assistant, watch what shoppers ask, approve the
                suggested fixes, and use the report to prove progress to each
                merchant.
              </p>
            </div>

            <ul className="space-y-6">
              {[
                {
                  label: "Revenue context",
                  text: "Spot questions that block product discovery and checkout confidence.",
                },
                {
                  label: "Support context",
                  text: "Escalate refunds, complaints, and account-specific requests with summaries.",
                },
                {
                  label: "Agency context",
                  text: "Reuse proven playbooks while keeping each client's tone and policies separate.",
                },
              ].map((item) => (
                <li key={item.label} className="group flex items-start gap-4">
                  <div className="mt-1.5 h-1 w-6 rounded-full bg-zinc-800 transition-all group-hover:w-8 group-hover:bg-accent" />

                  <p className="text-sm text-zinc-400 transition-colors group-hover:text-zinc-200">
                    <strong className="font-medium text-white">
                      {item.label}:
                    </strong>{" "}
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>

            <a
              href="/dashboard/docs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent"
            >
              View implementation docs
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-accent/5 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent">
                  Copilot loop
                </h3>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                  <div className="h-2 w-2 rounded-full bg-white/10" />
                </div>
              </div>

              <ol className="relative space-y-8">
                <div className="absolute left-[19px] top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-accent/50 via-zinc-800 to-transparent" />

                {steps.map((step, index) => (
                  <li key={step.title} className="relative flex gap-6">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#030303] text-sm font-bold text-white shadow-xl">
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

              <a
                href="/dashboard/integrations"
                className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start with an integration
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
