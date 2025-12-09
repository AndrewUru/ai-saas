export function CallToAction() {
  return (
    <section className="border-t border-slate-900 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-center sm:px-10 lg:px-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
          Ready to scale
        </p>
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Launch your first agent for a client today
        </h2>
        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
          Create an account, connect your client&apos;s WooCommerce store, and
          deliver a full support experience in under an hour.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/signup"
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Create free account
          </a>
          <a
            href="/billing"
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:text-emerald-200"
          >
            View plans
          </a>
        </div>
        <p className="text-xs text-slate-500">
          No card required. Upgrade only when your volume grows.
        </p>
      </div>
    </section>
  );
}
