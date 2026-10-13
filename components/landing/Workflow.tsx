"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Database,
  MessageCircle,
  PackageSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const stages = [
  {
    eyebrow: "01 · Listen",
    title: "A shopper asks a real buying question.",
    detail:
      "The agent captures intent, urgency, budget, and the product context behind the message.",
    metric: "Intent: delivery confidence",
    icon: MessageCircle,
    accent: "text-sky-300",
    surface: "bg-sky-300",
  },
  {
    eyebrow: "02 · Ground",
    title: "The answer uses live store knowledge.",
    detail:
      "Catalog, stock, variants, shipping rules, and approved content are searched before the reply is composed.",
    metric: "4 sources checked",
    icon: PackageSearch,
    accent: "text-violet-300",
    surface: "bg-violet-300",
  },
  {
    eyebrow: "03 · Detect",
    title: "The conversation becomes a signal.",
    detail:
      "Repeated hesitation is grouped into an opportunity your team can understand instead of disappearing into chat history.",
    metric: "Pattern: shipping threshold",
    icon: BrainCircuit,
    accent: "text-amber-300",
    surface: "bg-amber-300",
  },
  {
    eyebrow: "04 · Improve",
    title: "Your team approves the next best action.",
    detail:
      "Turn the signal into a FAQ, prompt rule, recommendation, or human handoff without giving up control.",
    metric: "Rule ready to publish",
    icon: Check,
    accent: "text-emerald-300",
    surface: "bg-emerald-300",
  },
] as const satisfies readonly {
  eyebrow: string;
  title: string;
  detail: string;
  metric: string;
  icon: LucideIcon;
  accent: string;
  surface: string;
}[];

export function Workflow() {
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const active = stages[activeStage];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stage);
        if (Number.isInteger(index)) setActiveStage(index);
      },
      { rootMargin: "-28% 0px -42%", threshold: [0.15, 0.45, 0.75] },
    );

    const elements = stageRefs.current;
    elements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      className="relative isolate overflow-clip bg-[#050505] py-24 sm:py-32"
    >
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute left-[-18rem] top-1/3 h-[38rem] w-[38rem] rounded-full bg-sky-500/8 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            From conversation to action
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            Watch one question improve the whole store.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            The same interaction helps the shopper now and teaches your team
            what to fix next.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0f]/90 p-4 shadow-[0_36px_120px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-300" aria-hidden="true" />
                  <span className="text-xs font-semibold text-white">
                    Commerce signal trace
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600">
                  Session #0842
                </span>
              </div>

              <div className="grid gap-5 py-6 sm:grid-cols-[140px_1fr]">
                <div className="relative flex flex-row justify-between sm:flex-col">
                  <div className="pointer-events-none absolute left-4 right-4 top-4 h-px bg-white/8 sm:bottom-4 sm:left-4 sm:right-auto sm:h-auto sm:w-px" />
                  {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isCurrent = activeStage === index;
                    const isComplete = activeStage > index;

                    return (
                      <button
                        key={stage.eyebrow}
                        type="button"
                        aria-label={`Show ${stage.title}`}
                        aria-pressed={isCurrent}
                        onClick={() => setActiveStage(index)}
                        className="relative z-10 flex items-center gap-3 text-left"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                            isCurrent
                              ? `${stage.surface} border-transparent text-black shadow-[0_0_30px_rgba(255,255,255,.15)]`
                              : isComplete
                                ? "border-white/20 bg-white/10 text-white"
                                : "border-white/8 bg-[#0d0d0f] text-zinc-700"
                          }`}
                        >
                          {isComplete ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </span>
                        <span
                          className={`hidden text-[10px] font-semibold uppercase tracking-[0.14em] transition sm:block ${
                            isCurrent ? stage.accent : "text-zinc-700"
                          }`}
                        >
                          {stage.eyebrow.split(" · ")[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative min-h-[330px] overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/35 p-5 sm:min-h-[390px] sm:p-6">
                  <div
                    key={activeStage}
                    className="landing-stage-in relative flex h-full flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${active.accent}`}>
                        {active.eyebrow}
                      </span>
                      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[9px] text-zinc-500">
                        {active.metric}
                      </span>
                    </div>

                    <div className="flex flex-1 items-center justify-center py-7">
                      {activeStage === 0 ? (
                        <div className="w-full space-y-3">
                          <div className="ml-auto max-w-[78%] rounded-[1.25rem_1.25rem_.3rem_1.25rem] bg-white px-4 py-3 text-sm leading-6 text-zinc-900 shadow-xl">
                            Will this arrive before Friday?
                          </div>
                          <div className="max-w-[88%] rounded-[1.25rem_1.25rem_1.25rem_.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300">
                            Let me check delivery and stock for your location.
                          </div>
                        </div>
                      ) : activeStage === 1 ? (
                        <div className="w-full space-y-2">
                          {[
                            [Database, "Shipping policy", "Matched"],
                            [PackageSearch, "Sand variant", "12 in stock"],
                            [Sparkles, "Delivery estimate", "Thursday"],
                          ].map(([Icon, label, status]) => {
                            const SourceIcon = Icon as LucideIcon;
                            return (
                              <div
                                key={label as string}
                                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3"
                              >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-300/10 text-violet-300">
                                  <SourceIcon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1 text-xs text-zinc-300">
                                  {label as string}
                                </span>
                                <span className="text-[10px] text-zinc-600">
                                  {status as string}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : activeStage === 2 ? (
                        <div className="w-full rounded-[1.5rem] border border-amber-300/15 bg-amber-300/[0.04] p-5">
                          <BrainCircuit className="h-7 w-7 text-amber-300" aria-hidden="true" />
                          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                            Pattern found
                          </p>
                          <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
                            Shipping confidence is blocking product decisions.
                          </p>
                          <p className="mt-4 text-xs leading-5 text-zinc-500">
                            Similar intent appeared in 18 recent conversations.
                          </p>
                        </div>
                      ) : (
                        <div className="w-full rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.04] p-5">
                          <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-300">
                              Ready to publish
                            </span>
                          </div>
                          <p className="mt-7 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Suggested improvement
                          </p>
                          <p className="mt-2 text-xl font-semibold leading-7 text-white">
                            Show the delivery promise on product pages and use it
                            in recommendation replies.
                          </p>
                          <button
                            type="button"
                            className="mt-6 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black"
                          >
                            Approve improvement
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                      <ActiveIcon className={`h-3.5 w-3.5 ${active.accent}`} aria-hidden="true" />
                      Signal remains linked to the source conversation
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {stages.map((stage, index) => (
                  <span
                    key={stage.eyebrow}
                    className={`h-1 rounded-full transition-colors duration-500 ${
                      index <= activeStage ? stage.surface : "bg-white/5"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const selected = activeStage === index;

              return (
                <div
                  key={stage.eyebrow}
                  ref={(element) => {
                    stageRefs.current[index] = element;
                  }}
                  data-stage={index}
                  className="flex min-h-[48svh] items-center py-8 lg:min-h-[54svh]"
                >
                  <button
                    type="button"
                    onClick={() => setActiveStage(index)}
                    className={`group w-full border-l px-6 text-left transition-all duration-500 sm:px-8 ${
                      selected
                        ? "border-white/60"
                        : "border-white/8 opacity-45 hover:opacity-80"
                    }`}
                  >
                    <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${selected ? stage.accent : "text-zinc-600"}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {stage.eyebrow}
                    </span>
                    <h3 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                      {stage.title}
                    </h3>
                    <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
                      {stage.detail}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
