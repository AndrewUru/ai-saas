export default function DocsPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Documentation
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Simple guides to launch widgets on your clients’ stores
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Follow step-by-step tutorials to create, customize, and install
            widgets on WooCommerce, Shopify, or custom storefronts — without
            touching databases, API keys, or complex configs.
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Create your first widget
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Learn how to pick an agent, copy a ready-made script, and embed it
              on any page. No Supabase setup, no API keys — just copy, paste,
              and test on your client’s staging site.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              Widgets & components
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Customize colors, texts, and position of the widget, add basic
              analytics events, and trigger your existing marketing flows — all
              with copy-paste snippets your dev team can plug into any stack.
            </p>
          </article>
        </div>

        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-white">
            Need something specific?
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Reach out to support to get tailored examples or a technical
            walkthrough alongside your dev team.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Contact technical support
          </a>
        </div>
      </section>
    </main>
  );
}
