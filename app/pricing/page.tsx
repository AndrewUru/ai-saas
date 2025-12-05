// app/pricing/page.tsx
import Link from "next/link";

const plans = [
  {
    name: "Free",
    headline: "Up to 1,000 messages/month",
    price: "$0",
    period: "per month",
    description:
      "Perfect to test the dashboard and launch your first agent.",
    features: [
      "1 active agent with embeddable widget",
      "Allowed domains validation",
      "Customizable prompts and branding",
      "Email support with basic SLA",
      "Active plan",
    ],
    cta: { label: "Current plan", href: "/dashboard" },
    highlight: false,
    badge: "Active",
  },
  {
    name: "Basic",
    headline: "Up to 2,000 messages/month",
    price: "$29",
    period: "per month",
    description:
      "For agencies launching agents in more than one store.",
    features: [
      "Up to 5 agents in parallel",
      "Priority WooCommerce integration",
      "Alerts when you approach the limit",
      "Monthly usage reports",
    ],
    cta: { label: "Upgrade to Basic", href: "/contact" },
    highlight: true,
    badge: null,
  },
  {
    name: "Pro",
    headline: "Up to 10,000 messages/month",
    price: "$79",
    period: "per month",
    description: "For 24/7 operations with high volume and escalations.",
    features: [
      "Up to 15 dedicated agents",
      "Webhook and PayPal subscriptions",
      "Custom escalation routes",
      "Guided onboarding support",
      "Talk to upgrade",
    ],
    cta: { label: "Talk to sales", href: "/contact" },
    highlight: false,
    badge: null,
  },
];

export default function PricingPage() {
  return (
    <main className="relative flex-1 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.15),transparent_55%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Pricing
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Choose the plan that fits your agents
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Switch plans as your volume grows. Every plan includes secure
            widgets, prompts, and domain controls out of the box.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col gap-4 rounded-3xl border bg-slate-900/70 p-6 shadow-xl shadow-emerald-500/10 backdrop-blur transition hover:border-emerald-400/50 ${
                plan.highlight
                  ? "border-emerald-400/60 bg-gradient-to-b from-emerald-500/10 via-slate-900/70 to-slate-900/80"
                  : "border-slate-800"
              }`}
            >
              {plan.badge && (
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                  {plan.headline}
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {plan.name}
                </h2>
                <p className="text-sm text-slate-300">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </div>

              <ul className="space-y-2 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={`mt-auto inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    : "border border-slate-700 text-slate-100 hover:border-emerald-400/60 hover:text-emerald-200"
                }`}
              >
                {plan.cta.label}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-lg shadow-emerald-500/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Need more than 10,000 messages?
              </p>
              <p className="text-xs text-slate-400">
                We support higher volumes with custom limits, SLAs, and routing.
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
