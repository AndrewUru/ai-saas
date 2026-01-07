export function CallToAction() {
  return (
    <section className="border-t border-border bg-surface/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-center sm:px-10 lg:px-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
          Ready to scale
        </p>
        <h2 className="text-3xl font-semibold sm:text-4xl text-foreground">
          Launch your first agent for a client today
        </h2>
        <p className="mx-auto max-w-2xl text-base text-[var(--foreground-muted)] sm:text-lg">
          Create an account, connect your client&apos;s WooCommerce store, and
          deliver a full support experience in under an hour.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/signup" className="ui-button ui-button--primary">
            Create free account
          </a>
          <a href="/pricing" className="ui-button ui-button--ghost">
            View plans
          </a>
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">
          No card required. Upgrade only when your volume grows.
        </p>
      </div>
    </section>
  );
}
