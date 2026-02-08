export default function DocsPage() {
  return (
    <main className="text-slate-100" data-oid="x63jcnu">
      <section
        className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16"
        data-oid="vdoui5a"
      >
        {/* HEADER */}
        <header
          className="space-y-4 text-center sm:text-left"
          data-oid="f9m.lco"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
            data-oid="oklef4y"
          >
            Documentation
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl" data-oid="xpnrygy">
            Launch AI widgets on your clients’ stores — without friction
          </h1>
          <p className="text-base text-slate-300 sm:text-lg" data-oid="u.m9o9a">
            This guide walks you through real-world installation scenarios:
            WordPress, Shopify, custom HTML sites, and modern frameworks like
            React or Next.js. Follow these steps to avoid common setup errors
            and get your widget live in minutes.
          </p>
        </header>

        {/* GRID */}
        <div className="mt-16 grid gap-8 md:grid-cols-2" data-oid="22vn53u">
          {/* CREATE */}
          <article
            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
            data-oid="reig:3_"
          >
            <h2 className="text-lg font-semibold text-white" data-oid="dzj7350">
              1. Create your first widget
            </h2>
            <p className="mt-3 text-sm text-slate-300" data-oid="jbzc77:">
              Choose an agent, customize branding (colors, label, greeting,
              position), and copy the generated embed script.
              <br data-oid="7bol1y6" />
              <br data-oid=".b4boyx" />
              You don’t need to manage databases, API keys, or environment
              variables. Every widget is linked to a secure agent key and
              validated automatically.
            </p>
          </article>

          {/* CUSTOMIZE */}
          <article
            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
            data-oid="7p_7hjx"
          >
            <h2 className="text-lg font-semibold text-white" data-oid="2eo.d1l">
              2. Customize behavior & branding
            </h2>
            <p className="mt-3 text-sm text-slate-300" data-oid="31ndrsb">
              Control the widget appearance and behavior using URL parameters:
              accent color, brand name, greeting message, button label, and
              screen position.
              <br data-oid="tox1sf_" />
              <br data-oid="80g99qd" />
              Changes are applied instantly — no rebuilds or redeploys needed.
            </p>
          </article>
        </div>

        {/* INSTALLATION */}
        <div
          className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
          data-oid=".xqejgv"
        >
          <h2 className="text-lg font-semibold text-white" data-oid="49_qa4g">
            3. Install the widget (important)
          </h2>

          <p className="mt-3 text-sm text-slate-300" data-oid="6n5s29a">
            The embed script is designed for standard HTML environments. Choose
            the correct installation method depending on your stack.
          </p>

          <ul
            className="mt-6 space-y-4 text-sm text-slate-300"
            data-oid="l8.l96n"
          >
            <li data-oid="hq7t8nx">
              <strong className="text-white" data-oid="_49masn">
                WordPress / Shopify / Webflow
              </strong>
              <br data-oid="mpzbskm" />
              Paste the full script into the site footer, custom HTML block, or
              a plugin like “Insert Headers and Footers”.
            </li>
            <li data-oid="51tjbk8">
              <strong className="text-white" data-oid="2r8ezc5">
                Static HTML sites
              </strong>
              <br data-oid="gg1o_ik" />
              Paste the script right before the closing{" "}
              <code data-oid="9nguwy4">&lt;/body&gt;</code> tag.
            </li>
            <li data-oid="atxwq03">
              <strong className="text-white" data-oid="809urhi">
                React / Next.js projects
              </strong>
              <br data-oid="2vkkqey" />
              Do not paste the raw script inside JSX. Use a framework-specific
              loader (for example, Next.js{" "}
              <code data-oid="pgsbu:t">next/script</code>).
            </li>
          </ul>
        </div>

        {/* DOMAINS */}
        <div
          className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
          data-oid="9af2yem"
        >
          <h2 className="text-lg font-semibold text-white" data-oid="fvmc291">
            4. Allowed domains & security
          </h2>
          <p className="mt-3 text-sm text-slate-300" data-oid="4:vmaaz">
            Each widget is protected by domain validation. The widget will only
            load on domains explicitly allowed in the agent settings.
          </p>

          <ul
            className="mt-6 space-y-3 text-sm text-slate-300"
            data-oid="nm:c3v4"
          >
            <li data-oid="hm7onnf">
              •{" "}
              <strong className="text-white" data-oid="jsi:6pb">
                elsaltoweb.es
              </strong>{" "}
              is not the same as{" "}
              <strong className="text-white" data-oid=":8dgv3k">
                agentes.elsaltoweb.es
              </strong>
            </li>
            <li data-oid="807_gtb">
              • If you see a <code data-oid="_szscn9">403</code> error, the
              current domain is not authorized
            </li>
            <li data-oid="5ilhece">
              • Add all required domains or subdomains, or use a wildcard like{" "}
              <code data-oid="dejq1i:">*.example.com</code>
            </li>
          </ul>

          <p className="mt-4 text-sm text-slate-400" data-oid="7gv6ind">
            Tip: During development, you can temporarily leave allowed domains
            empty to test from localhost or staging environments.
          </p>
        </div>

        {/* TROUBLESHOOTING */}
        <div
          className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
          data-oid="mbv8xxz"
        >
          <h2 className="text-lg font-semibold text-white" data-oid="1a-mfpr">
            Common issues & troubleshooting
          </h2>

          <ul
            className="mt-4 space-y-3 text-sm text-slate-300"
            data-oid="t:4g7c6"
          >
            <li data-oid="ly_cflr">
              • Widget not appearing → Check allowed domains
            </li>
            <li data-oid="iapoyg8">• Console shows 403 → Domain mismatch</li>
            <li data-oid="x.5ertj">
              • Script error in React → Wrong installation method
            </li>
            <li data-oid="-_zw1a3">
              • Nothing loads → Verify the agent key is active
            </li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div
          className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-center sm:text-left"
          data-oid="9noa_0a"
        >
          <h2 className="text-lg font-semibold text-white" data-oid="h_pd0gk">
            Need help or a custom setup?
          </h2>
          <p className="mt-3 text-sm text-slate-300" data-oid="r9d8ewo">
            Our technical team can help you validate domains, adapt the widget
            to your stack, or provide framework-specific examples.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            data-oid=".c35kg9"
          >
            Contact technical support
          </a>
        </div>
      </section>
    </main>
  );
}
