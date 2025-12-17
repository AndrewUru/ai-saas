export default function AboutPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            About us
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            We empower agencies that build memorable ecommerce stores
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            AI SaaS was born after working alongside web studios that needed to
            scale support without losing each brand’s tone. We built the
            platform so your team can deploy reliable agents, measure results,
            and offer a recurring service to your clients.
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">Our manifesto</h2>
            <p className="text-sm text-slate-300">
              We believe automation should strengthen the relationship between
              agency and brand, not replace it. That’s why we prioritize
              granular controls, transparent analytics, and an onboarding flow
              your team can replicate in a matter of hours.
            </p>
          </article>
          <article className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-xl font-semibold text-white">What’s next</h2>
            <p className="text-sm text-slate-300">
              We’re expanding integrations with CRMs and payment platforms, plus
              a marketplace of agency-verified prompts to speed up every new
              ecommerce project.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
