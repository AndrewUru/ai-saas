// app/pricing/page.tsx
import PricingCards from "@/components/PricingCards";
import Link from "next/link";

export default function PricingPage() {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main
      className="relative flex-1 bg-slate-950 text-slate-100"
      data-oid="i38k3sm"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.15),transparent_55%)]"
        data-oid="xugo_p4"
      />

      <section
        className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16"
        data-oid="y9rj0wn"
      >
        <div className="space-y-4 text-center" data-oid="e-sb2vq">
          <p
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200"
            data-oid="sla84:2"
          >
            Pricing
          </p>

          <h1
            className="text-3xl font-semibold leading-tight sm:text-4xl"
            data-oid="ai5m7d8"
          >
            Free AI for everyone. Upgrade for higher limits and priority
            support.
          </h1>

          <p
            className="mx-auto max-w-2xl text-sm text-slate-300 sm:text-base"
            data-oid="x4gfaqd"
          >
            All users can chat with AI. The difference is branding removal,
            support, and higher limits. Start free and upgrade anytime.
          </p>
        </div>

        <PricingCards clientId={paypalClientId} data-oid="s8d.xxh" />

        <div className="mt-10 grid gap-4 md:grid-cols-3" data-oid="f5dwqa_">
          <div
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300"
            data-oid="tx2fqsr"
          >
            <p className="text-sm font-semibold text-white" data-oid="10am_s:">
              What’s included
            </p>
            <ul
              className="mt-3 space-y-2 text-xs text-slate-400"
              data-oid="u5ec6b4"
            >
              <li data-oid="f3397x6">• AI chat for all plans</li>
              <li data-oid="gs2w:xs">• Secure widget + domain allowlist</li>
              <li data-oid="j8p8jpp">• Prompt & branding customization</li>
              <li data-oid="26j9_d9">
                • Analytics & message limits (per plan)
              </li>
            </ul>
          </div>

          <div
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300"
            data-oid="ki2f630"
          >
            <p className="text-sm font-semibold text-white" data-oid="h..z9z1">
              Free plan
            </p>
            <p className="mt-2 text-xs text-slate-400" data-oid="aopj44h">
              Ideal to test the widget and run up to five agents.
            </p>
            <p className="mt-3 text-xs text-slate-400" data-oid="untt6_q">
              • Up to 5 agents • Basic limits • Community support
            </p>
          </div>

          <div
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-slate-200 shadow-lg shadow-emerald-500/10"
            data-oid="bv2qgs4"
          >
            <p className="text-sm font-semibold text-white" data-oid="h-1gkns">
              PRO
            </p>
            <p className="mt-2 text-xs text-emerald-100/80" data-oid="wiw6:vg">
              For creators & agencies managing multiple stores/clients.
            </p>
            <p className="mt-3 text-xs text-emerald-100/80" data-oid="ptk5:e5">
              • Removed branding • Priority support • Higher limits
            </p>
          </div>
        </div>

        <div
          className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-lg shadow-emerald-500/10"
          data-oid="7rr1pd1"
        >
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            data-oid="tbfloac"
          >
            <div data-oid="3l_0vj4">
              <p
                className="text-sm font-semibold text-white"
                data-oid="ali1rqt"
              >
                Need custom limits or agency features?
              </p>
              <p className="text-xs text-slate-400" data-oid="yejge4c">
                We can tailor agent caps, message volumes, and onboarding.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              data-oid="-cufw8_"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
