export default function DocsPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16">
        {/* HEADER */}
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Documentation
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Launch AI widgets on your clients’ stores — without friction
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            This guide walks you through real-world installation scenarios:
            WordPress, Shopify, custom HTML sites, and modern frameworks like
            React or Next.js. Follow these steps to avoid common setup errors
            and get your widget live in minutes.
          </p>
        </header>

        {/* GRID */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* CREATE */}
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              1. Create your first widget
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Choose an agent, customize branding (colors, label, greeting,
              position), and copy the generated embed script.
              <br />
              <br />
              You don’t need to manage databases, API keys, or environment
              variables. Every widget is linked to a secure agent key and
              validated automatically.
            </p>
          </article>

          {/* CUSTOMIZE */}
          <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-lg font-semibold text-white">
              2. Customize behavior & branding
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Control the widget appearance and behavior using URL parameters:
              accent color, brand name, greeting message, button label, and
              screen position.
              <br />
              <br />
              Changes are applied instantly — no rebuilds or redeploys needed.
            </p>
          </article>
        </div>

        {/* INSTALLATION */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-lg font-semibold text-white">
            3. Install the widget (important)
          </h2>

          <p className="mt-3 text-sm text-slate-300">
            The embed script is designed for standard HTML environments.
            Choose the correct installation method depending on your stack.
          </p>

          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            <li>
              <strong className="text-white">WordPress / Shopify / Webflow</strong>
              <br />
              Paste the full script into the site footer, custom HTML block,
              or a plugin like “Insert Headers and Footers”.
            </li>
            <li>
              <strong className="text-white">Static HTML sites</strong>
              <br />
              Paste the script right before the closing <code>&lt;/body&gt;</code> tag.
            </li>
            <li>
              <strong className="text-white">React / Next.js projects</strong>
              <br />
              Do not paste the raw script inside JSX. Use a framework-specific
              loader (for example, Next.js <code>next/script</code>).
            </li>
          </ul>
        </div>

        {/* DOMAINS */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-lg font-semibold text-white">
            4. Allowed domains & security
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Each widget is protected by domain validation. The widget will only
            load on domains explicitly allowed in the agent settings.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>
              • <strong className="text-white">elsaltoweb.es</strong> is not the
              same as <strong className="text-white">agentes.elsaltoweb.es</strong>
            </li>
            <li>
              • If you see a <code>403</code> error, the current domain is not authorized
            </li>
            <li>
              • Add all required domains or subdomains, or use a wildcard
              like <code>*.example.com</code>
            </li>
          </ul>

          <p className="mt-4 text-sm text-slate-400">
            Tip: During development, you can temporarily leave allowed domains
            empty to test from localhost or staging environments.
          </p>
        </div>

        {/* TROUBLESHOOTING */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-lg font-semibold text-white">
            Common issues & troubleshooting
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Widget not appearing → Check allowed domains</li>
            <li>• Console shows 403 → Domain mismatch</li>
            <li>• Script error in React → Wrong installation method</li>
            <li>• Nothing loads → Verify the agent key is active</li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-white">
            Need help or a custom setup?
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Our technical team can help you validate domains, adapt the widget
            to your stack, or provide framework-specific examples.
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
