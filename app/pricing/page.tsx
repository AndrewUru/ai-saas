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
            Choose the plan that fits your agents
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Switch plans as your volume grows. Every plan includes secure
            widgets, prompts, and domain controls out of the box.
          </p>
        </div>

        <PricingCards clientId={paypalClientId} />

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
