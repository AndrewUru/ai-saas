// app/pricing/page.tsx
import PricingCards from "@/components/PricingCards";
import Link from "next/link";

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
            Free AI for everyone. Upgrade for higher limits and priority support.
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base">
            All users can chat with AI. The difference is branding removal,
            support, and higher limits. Start free and upgrade anytime.
          </p>
        </div>

        <PricingCards clientId={paypalClientId} />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            <p className="text-sm font-semibold text-white">What’s included</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>• AI chat for all plans</li>
              <li>• Secure widget + domain allowlist</li>
              <li>• Prompt & branding customization</li>
              <li>• Analytics & message limits (per plan)</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            <p className="text-sm font-semibold text-white">Free plan</p>
            <p className="mt-2 text-xs text-slate-400">
              Ideal to test the widget and run up to five agents.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              • Up to 5 agents • Basic limits • Community support
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-slate-200 shadow-lg shadow-emerald-500/10">
            <p className="text-sm font-semibold text-white">PRO</p>
            <p className="mt-2 text-xs text-emerald-100/80">
              For creators & agencies managing multiple stores/clients.
            </p>
            <p className="mt-3 text-xs text-emerald-100/80">
              • Removed branding • Priority support • Higher limits
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-lg shadow-emerald-500/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Need custom limits or agency features?
              </p>
              <p className="text-xs text-slate-400">
                We can tailor agent caps, message volumes, and onboarding.
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
