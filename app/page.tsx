// app/page.tsx
export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-10 px-6 py-24 sm:px-10 lg:px-16">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              AI agents for commerce
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Automate store support with AI agents your customers trust
            </h1>
            <p className="text-lg text-slate-200 sm:text-xl">
              Deploy customizable AI agents that answer questions, follow your
              policies, connect to WooCommerce, and close more sales without the
              overhead of a support team.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/dashboard"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Access your dashboard
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
                label: "Qualified conversations",
                value: "40k+",
              },
              {
                label: "WooCommerce stores assisted",
                value: "1,200+",
              },
              {
                label: "Integrations and automations",
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

      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Everything you need to launch a revenue ready agent
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            From gathering product data to payment validation, our platform
            gives you a single place to design, deploy, and measure AI support
            teams for ecommerce.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "WooCommerce native integration",
              body: "Sync catalog, stock, and order history in seconds. Your agent always responds with up to date pricing and availability.",
            },
            {
              title: "Conversation guardrails",
              body: "Define tone, escalation policies, and fallback flows so every interaction reflects your brand voice.",
            },
            {
              title: "Secure credential vault",
              body: "Store API keys with zero knowledge encryption. Rotate credentials without redeploying widgets.",
            },
            {
              title: "Multi channel widgets",
              body: "Embed the chat widget on WordPress, Shopify, or custom storefronts with a single script tag.",
            },
            {
              title: "Real time analytics",
              body: "Track conversions, saved replies, and message volume from a unified dashboard that updates live.",
            },
            {
              title: "Compliant billing",
              body: "Connect PayPal or credit card billing to enforce plan limits automatically across all your agents.",
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-900/40"
            >
              <h3 className="text-lg font-semibold text-emerald-300">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-slate-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-900 bg-slate-950/70">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Built for your existing workflow
            </h2>
            <p className="text-base text-slate-300 sm:text-lg">
              Our API-first stack makes it easy to extend each agent with the
              tools you already rely on. Connect custom CRMs, marketing
              automations, or fulfillment systems without compromising security.
            </p>
            <ul className="space-y-4 text-sm text-slate-200">
              {[
                "Server side Supabase auth keeps every request scoped to your workspace.",
                "Webhooks notify your systems when leads, refunds, or VIP customers need a human follow up.",
                "Granular access controls let you share analytics with teammates while keeping credentials locked down.",
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
                Explore developer docs
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
                  title: "Create your agent",
                  detail:
                    "Describe your brand voice, upload FAQs, and define escalation paths in minutes.",
                },
                {
                  title: "Connect data sources",
                  detail:
                    "Authorize WooCommerce, knowledge bases, and payment providers with secure tokens.",
                },
                {
                  title: "Embed the widget",
                  detail:
                    "Copy the script snippet into your storefront footer and start serving customers instantly.",
                },
                {
                  title: "Monitor performance",
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

      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Trusted by digital brands that move fast
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Teams across retail, subscriptions, and DTC rely on our agents to
              keep support available 24/7 while staying on brand.
            </p>
          </div>
          <div className="space-y-6 lg:col-span-2">
            {[
              {
                quote:
                  "We replaced a three person support shift and now resolve 82 percent of tickets automatically. Customers love the instant answers.",
                author: "Lucia Torres",
                role: "Head of CX, Nordia Beauty",
              },
              {
                quote:
                  "Integrating WooCommerce took less than five minutes. Seeing real order data inside the chat unlocked proactive upsell flows.",
                author: "Victor Ramirez",
                role: "Founder, Casa Moda Store",
              },
              {
                quote:
                  "The analytics let us see which prompts convert best and when to bring in a human. It feels like having a teammate that never sleeps.",
                author: "Ana Walker",
                role: "COO, Sunwave Gear",
              },
            ].map((testimonial) => (
              <figure
                key={testimonial.author}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-900/40"
              >
                <blockquote className="text-lg text-slate-200">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm text-slate-400">
                  <span className="font-semibold text-white">
                    {testimonial.author}
                  </span>{" "}
                  &mdash; {testimonial.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-900 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-center sm:px-10 lg:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Ready to launch
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Launch your first AI agent today
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
            Create an account, connect your WooCommerce store, and ship a fully
            branded support experience in under an hour.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Create a free account
            </a>
            <a
              href="/billing"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
            >
              Compare plans
            </a>
          </div>
          <p className="text-xs text-slate-500">
            No credit card required. Upgrade only when you need more volume.
          </p>
        </div>
      </section>
    </main>
  );
}
