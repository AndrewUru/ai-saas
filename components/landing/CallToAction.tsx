import Link from "next/link";
import { ArrowRight, Check, Code2, PlugZap, Sparkles } from "lucide-react";

import { getI18n } from "@/lib/i18n/server";

const stepIcons = [PlugZap, Sparkles, Code2];

export async function CallToAction() {
  const { t } = await getI18n();
  const c = t.landing.cta;

  return (
    <section className="relative overflow-hidden bg-[#050505] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/12 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d0d0f]/90 shadow-[0_45px_140px_rgba(0,0,0,.65)] backdrop-blur-2xl">
        <div className="grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="p-7 sm:p-12 lg:p-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {c.badge}
            </span>
            <h2 className="mt-7 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
              {c.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
              {c.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-zinc-100 active:scale-[0.98]"
              >
                {c.primary}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-7 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                {c.secondary}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-zinc-500">
              {c.perks.map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative border-t border-white/8 bg-black/25 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(139,92,246,.12),transparent_42%)]" />
            <div className="relative flex h-full min-h-[360px] flex-col justify-center">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#09090b] p-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-zinc-400">
                    <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {c.installOnce}
                  </span>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-medium text-emerald-300">
                    {c.ready}
                  </span>
                </div>
                <code className="mt-4 block overflow-x-auto whitespace-nowrap rounded-xl bg-white/[0.025] p-4 font-mono text-[10px] leading-5 text-zinc-400 sm:text-xs">
                  <span className="text-violet-300">&lt;script</span>{" "}
                  <span className="text-sky-300">src</span>=
                  <span className="text-amber-200">
                    &quot;.../api/widget?key=your_agent&quot;
                  </span>{" "}
                  <span className="text-violet-300">/&gt;</span>
                </code>
              </div>

              <div className="mx-auto h-8 w-px bg-gradient-to-b from-violet-300/50 to-white/10" />

              <div className="grid grid-cols-3 gap-2">
                {c.steps.map(({ label, status }, index) => {
                  const StepIcon = stepIcons[index];
                  return (
                    <div
                      key={label}
                      className="rounded-xl border border-white/8 bg-white/[0.025] p-3 text-center"
                    >
                      <StepIcon className="mx-auto h-4 w-4 text-zinc-300" aria-hidden="true" />
                      <p className="mt-3 text-[10px] font-semibold text-white">
                        {label}
                      </p>
                      <p className="mt-1 text-[8px] text-zinc-600">
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
