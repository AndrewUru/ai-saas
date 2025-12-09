export default function PrivacyPage() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Legal Documentation
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            This page summarizes how we collect, use, and protect the data
            entrusted to us by ecommerce agencies and their clients. This
            document is updated as we add new features to the platform.
          </p>
        </header>

        <article className="mt-12 space-y-6 text-sm text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Data We Store
            </h2>
            <p>
              We only store the information required to operate the agents:
              encrypted credentials from external services, billing details,
              and the messages exchanged with end customers. We do not share
              this data with third parties outside the agency that owns the
              account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Data Processing
            </h2>
            <p>
              Access to sensitive information is limited to automated system
              processes. Any manual intervention (technical support or audits)
              requires written authorization from the agency and is logged.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Retention and Deletion
            </h2>
            <p>
              You may request full deletion of your data at any time. We retain
              records for 30 days after account cancellation to comply with
              accounting obligations and to address potential incidents.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
