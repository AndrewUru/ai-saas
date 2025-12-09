export function Workflow() {
  return (
    <section className="border-y border-border bg-surface/30 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold sm:text-4xl text-foreground">
            Built for your agency&apos;s workflow
          </h2>
          <p className="text-base text-[var(--foreground-muted)] sm:text-lg">
            Our API-first architecture makes it easy to extend each agent with
            the tools you already use. Connect CRMs, automations, or fulfillment
            systems without compromising security.
          </p>
          <ul className="space-y-4 text-sm text-[var(--foreground-muted)]">
            {[
              "Supabase server-side auth keeps every request scoped to your agency workspace.",
              "Webhooks alert your stack when leads, returns, or VIP customers need human follow-up.",
              "Granular permissions share analytics with clients and teammates without exposing credentials.",
            ].map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface/50 p-4"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <a
              href="/docs"
              className="ui-button ui-button--ghost"
            >
              View technical docs
            </a>
            <a
              href="/contact"
              className="ui-button ui-button--subtle"
            >
              Talk to sales
            </a>
          </div>
        </div>
        <div className="space-y-6 rounded-3xl border border-border bg-gradient-to-br from-surface via-surface-strong to-black p-8 shadow-2xl shadow-accent/5">
          <h3 className="text-xl font-semibold text-accent">
            How it works
          </h3>
          <ol className="space-y-4 text-sm text-[var(--foreground-muted)]">
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-surface text-base font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="mt-1 text-[var(--foreground-muted)]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
