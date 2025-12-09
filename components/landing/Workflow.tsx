export function Workflow() {
  return (
    <section className="border-y border-slate-900 bg-slate-950/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Built for your agency&apos;s workflow
          </h2>
          <p className="text-base text-slate-300 sm:text-lg">
            Our API-first architecture makes it easy to extend each agent with
            the tools you already use. Connect CRMs, automations, or fulfillment
            systems without compromising security.
          </p>
          <ul className="space-y-4 text-sm text-slate-200">
            {[
              "Supabase server-side auth keeps every request scoped to your agency workspace.",
              "Webhooks alert your stack when leads, returns, or VIP customers need human follow-up.",
              "Granular permissions share analytics with clients and teammates without exposing credentials.",
            ].map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <a
              href="/docs"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
            >
              View technical docs
            </a>
            <a
              href="/contact"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Talk to sales
            </a>
          </div>
        </div>
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl shadow-emerald-500/10">
          <h3 className="text-xl font-semibold text-emerald-300">
            How it works
          </h3>
          <ol className="space-y-4 text-sm text-slate-200">
            {[
              {
                title: "Create the agent",
                detail:
                  "Describe the brand voice, upload FAQs, and define escalation paths in minutes.",
              },
              {
                title: "Connect data sources",
                detail:
                  "Authorize WooCommerce, knowledge bases, and payment gateways with secure tokens.",
              },
              {
                title: "Embed the widget",
                detail:
                  "Paste the script into the store footer and start serving customers instantly.",
              },
              {
                title: "Monitor results",
                detail:
                  "Review analytics, tweak prompts, and escalate conversations directly from the dashboard.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400 bg-slate-900 text-base font-semibold text-emerald-300">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="mt-1 text-slate-300">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
