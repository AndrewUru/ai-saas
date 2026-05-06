const features = [
  {
    title: "Opportunity board",
    body: "Detect price objections, stock questions, delivery friction, refund intent, and product demand patterns from real chats.",
  },
  {
    title: "Auto-training queue",
    body: "Turn weak answers into suggested FAQs, prompt rules, and handoff triggers your team can approve in minutes.",
  },
  {
    title: "Store playbooks",
    body: "Launch with opinionated flows for fashion, beauty, electronics, food, and subscription commerce instead of blank prompts.",
  },
  {
    title: "Human handoff cockpit",
    body: "Summarize escalations with customer intent, product context, and the next best reply for support teams.",
  },
  {
    title: "Sales-aware widget",
    body: "Recommend products, answer policy questions, and nudge shoppers toward bundles or alternatives when stock is limited.",
  },
  {
    title: "Agency reporting",
    body: "Show clients what the assistant learned: objections, missed answers, suggested improvements, and assisted conversations.",
  },
];

export function Features() {
  return (
    <section className="relative bg-[#030303] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-accent">
            Beyond chatbot software
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            A feedback loop for{" "}
            <span className="text-zinc-500">commerce growth.</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            The widget is only the surface. The real product is the system that
            learns where shoppers hesitate and tells your team what to improve.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative isolate flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-white transition-colors group-hover:border-accent/30 group-hover:text-accent">
                  {index + 1}
                </div>

                <h3 className="mt-6 text-lg font-semibold leading-7 text-white transition-colors group-hover:text-accent">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400 transition-colors group-hover:text-zinc-300">
                  {feature.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
