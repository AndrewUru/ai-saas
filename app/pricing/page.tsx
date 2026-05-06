import PricingCards from "@/components/PricingCards";
import Link from "next/link";

const included = [
  "AI chat widget for every plan",
  "Opportunity board for sales friction",
  "Prompt and branding customization",
  "Catalog-aware product answers",
];

const proBenefits = [
  "Removed branding",
  "Priority support",
  "Higher message limits",
  "Agency reporting workflow",
];

export default function PricingPage() {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main className="relative flex-1 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.15),transparent_55%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Pricing
          </p>

          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Start with the widget. Upgrade when insights become workflow.
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
            Every plan can answer shoppers. Pro is for teams that want higher
            limits, cleaner branding, and a stronger operating layer for client
            stores.
          </p>
        </div>

        <PricingCards clientId={paypalClientId} />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard title="What is included" items={included} />

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            <p className="text-sm font-semibold text-white">Best for testing</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Use the free plan to connect a store, launch initial agents, and
              see which questions shoppers ask before committing to a paid
              workflow.
            </p>
          </div>

          <InfoCard
            title="Why teams upgrade"
            items={proBenefits}
            highlighted
          />
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-lg shadow-emerald-500/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Need custom limits or agency features?
              </p>
              <p className="text-xs text-slate-400">
                We can tailor agent caps, message volumes, onboarding, and
                white-label reporting.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  items,
  highlighted = false,
}: {
  title: string;
  items: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? "rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-slate-200 shadow-lg shadow-emerald-500/10"
          : "rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300"
      }
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      <ul
        className={
          highlighted
            ? "mt-3 space-y-2 text-xs text-emerald-100/80"
            : "mt-3 space-y-2 text-xs text-slate-400"
        }
      >
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
