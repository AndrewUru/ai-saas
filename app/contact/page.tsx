export default function ContactPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Agency Support
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Let’s talk about your implementation
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Reach out to resolve technical questions, prepare client demos, or
            discuss enterprise plans tailored to your needs.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="space-y-3 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Email support</h2>
            <p className="text-sm text-slate-300">
              Send your inquiry to{" "}
              <a
                href="mailto:atobio459@gmail.com"
                className="text-emerald-300 hover:text-emerald-200"
              >
                atobio459@gmail.com
              </a>{" "}
              including the store URL and the number of agents you plan to
              deploy.
            </p>
          </article>

          <article className="space-y-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-100 shadow-lg shadow-emerald-500/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">
              Book a strategy session
            </h2>
            <p className="text-sm">
              We run integration workshops and prompt audits with your team.
              Request a session from the dashboard or via email.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
