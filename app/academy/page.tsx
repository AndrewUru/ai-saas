export default function AcademyPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Agency academy
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Certify your team in implementing ecommerce agents
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Get access to live sessions, downloadable playbooks, and prompt
            libraries ready to reuse with clients on WooCommerce, Shopify, or
            headless storefronts.
          </p>
        </header>

        <div className="mt-16 space-y-8">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Express onboarding program
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Four self-paced modules covering commercial discovery, technical
              setup, widget launch, and results tracking with real clients.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">Monthly labs</h2>
            <p className="mt-3 text-sm text-slate-300">
              Live sessions to review use cases, optimize prompts, and share
              automations across certified agencies.
            </p>
          </article>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Coming soon
            </p>
            <p className="mt-3 text-sm text-slate-300">
              We’re rolling out assessments to certify senior consultants and a
              repository of success stories you can share with potential
              clients.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
