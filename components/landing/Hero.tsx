"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";

import {
  getWidgetTemplate,
  type WidgetTemplateId,
  widgetTemplates,
} from "@/lib/widget/templates";

const conversations = [
  {
    label: "Delivery",
    question: "Will this arrive before Friday?",
    answer:
      "Yes. Order in the next 2 hours for Thursday delivery. The sand color is ready to ship.",
    insight: "Delivery hesitation detected",
    action: "Create a shipping reassurance rule",
  },
  {
    label: "Product fit",
    question: "Which one works best for sensitive skin?",
    answer:
      "The Calm Set is fragrance-free and has the gentlest formula. I can add the travel size too.",
    insight: "High-intent recommendation",
    action: "Suggest the Calm Set bundle",
  },
  {
    label: "Returns",
    question: "Can I return it if the size is wrong?",
    answer:
      "Absolutely. You have 30 days, and the first size exchange is free. Want the sizing guide?",
    insight: "Return-policy friction detected",
    action: "Surface size guidance earlier",
  },
] as const;

const templateIcons: Record<WidgetTemplateId, LucideIcon> = {
  whatsapp: MessageCircle,
  openai: Sparkles,
  "online-store": Store,
  "minimal-assistant": Bot,
};

export function Hero() {
  const [templateId, setTemplateId] =
    useState<WidgetTemplateId>("online-store");
  const [conversationIndex, setConversationIndex] = useState(0);
  const template = getWidgetTemplate(templateId);
  const conversation = conversations[conversationIndex];
  const appearance = template.settings.appearance;
  const ActiveIcon = templateIcons[templateId];

  return (
    <header className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden bg-[#050505]">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute -left-48 top-8 h-[34rem] w-[34rem] rounded-full blur-[150px] transition-colors duration-700"
        style={{ backgroundColor: `${template.settings.accent}24` }}
      />
      <div className="pointer-events-none absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-violet-500/10 blur-[160px]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] max-w-[90rem] gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.86fr)_minmax(560px,1.14fr)] lg:items-center lg:px-10 xl:gap-20">
        <div className="relative z-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                style={{ backgroundColor: template.settings.accent }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: template.settings.accent }}
              />
            </span>
            Commerce intelligence, live in every conversation
          </div>

          <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.055em] text-white sm:text-7xl lg:text-[5.25rem] lg:leading-[0.95]">
            Turn shopper questions into
            <span className="mt-2 block bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
              revenue signals.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
            An AI agent that sells, supports, and shows your team exactly where
            customers hesitate—before those questions become abandoned carts.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-zinc-100 active:scale-[0.98]"
            >
              Build your first agent
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#experience"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              See the intelligence loop
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
            <span>WooCommerce</span>
            <span className="h-1 w-1 rounded-full bg-zinc-800" />
            <span>Shopify</span>
            <span className="h-1 w-1 rounded-full bg-zinc-800" />
            <span>Install once</span>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[760px] lg:mx-0">
          <div
            className="pointer-events-none absolute inset-x-16 -top-10 h-32 rounded-full blur-[80px] transition-colors duration-700"
            style={{ backgroundColor: `${template.settings.accent}28` }}
          />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0d]/90 p-2 shadow-[0_40px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl sm:p-3">
            <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>
              <span className="rounded-full border border-white/8 bg-black/30 px-3 py-1 text-[10px] font-medium text-zinc-500">
                northstar.store
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            <div className="relative min-h-[540px] overflow-hidden rounded-[1.45rem] bg-[#eeeae2] sm:min-h-[590px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(255,255,255,.95),transparent_38%)]" />
              <div className="relative flex items-center justify-between border-b border-black/8 px-5 py-4 text-zinc-900 sm:px-7">
                <span className="text-sm font-black tracking-[-0.04em]">
                  NORTH/STAR
                </span>
                <div className="hidden items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:flex">
                  <span>New</span>
                  <span>Essentials</span>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              <div className="relative grid gap-4 p-5 sm:grid-cols-[1.2fr_.8fr] sm:p-7">
                <div className="relative min-h-[270px] overflow-hidden rounded-[1.4rem] bg-[#d9d0c3] p-6 sm:min-h-[430px]">
                  <div className="absolute -right-16 top-12 h-64 w-64 rounded-full border-[38px] border-[#c0aa91]/60" />
                  <div className="absolute bottom-[-4rem] right-6 h-72 w-32 rotate-[18deg] rounded-[4rem_4rem_1.5rem_1.5rem] bg-gradient-to-b from-[#3d2f29] to-[#171210] shadow-2xl" />
                  <p className="relative max-w-[12rem] text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#332b27] sm:text-4xl">
                    Everyday objects, considered.
                  </p>
                  <span className="absolute bottom-5 left-6 rounded-full bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-700 backdrop-blur">
                    Explore collection
                  </span>
                </div>

                <div className="hidden flex-col gap-4 sm:flex">
                  {[
                    ["Calm set", "$68", "#c8b8a4"],
                    ["Travel ritual", "$34", "#a9b0a2"],
                  ].map(([name, price, color]) => (
                    <div
                      key={name}
                      className="flex flex-1 flex-col justify-between rounded-[1.4rem] bg-white/65 p-4 text-zinc-800"
                    >
                      <div
                        className="mx-auto h-24 w-16 rounded-[2rem_2rem_.8rem_.8rem] shadow-lg"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-semibold">{name}</span>
                        <span className="text-xs text-zinc-500">{price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[350px]">
                <div
                  className="overflow-hidden rounded-[1.5rem] border shadow-[0_25px_80px_rgba(0,0,0,.32)] transition-colors duration-500"
                  style={{
                    borderColor: appearance.colorBubbleBorder,
                    backgroundColor: appearance.colorChatBg,
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      backgroundColor: appearance.colorHeaderBg,
                      color: appearance.colorHeaderText,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: template.settings.accent,
                          color: appearance.colorToggleText,
                        }}
                      >
                        <ActiveIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold">
                          {template.settings.brandName}
                        </span>
                        <span className="block text-[9px] opacity-65">
                          Catalog connected · online
                        </span>
                      </span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>

                  <div className="space-y-3 p-3.5">
                    <div
                      className="ml-auto max-w-[82%] rounded-[1rem_1rem_.25rem_1rem] px-3 py-2 text-[11px] leading-4"
                      style={{
                        backgroundColor: appearance.colorUserBubbleBg,
                        color: appearance.colorUserBubbleText,
                      }}
                    >
                      {conversation.question}
                    </div>
                    <div
                      className="max-w-[92%] rounded-[1rem_1rem_1rem_.25rem] px-3 py-2 text-[11px] leading-4"
                      style={{
                        backgroundColor: appearance.colorBotBubbleBg,
                        color: appearance.colorBotBubbleText,
                      }}
                    >
                      {conversation.answer}
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-amber-400/20 bg-[#111]/90 p-2.5 text-white shadow-xl backdrop-blur-xl">
                    <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-amber-300">
                      Insight
                    </span>
                    <p className="mt-1 text-[10px] leading-4 text-zinc-300">
                      {conversation.insight}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-400/20 bg-[#111]/90 p-2.5 text-white shadow-xl backdrop-blur-xl">
                    <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                      <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      Next action
                    </span>
                    <p className="mt-1 text-[10px] leading-4 text-zinc-300">
                      {conversation.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {conversations.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={conversationIndex === index}
                onClick={() => setConversationIndex(index)}
                className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition sm:px-3 ${
                  conversationIndex === index
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/7 bg-white/[0.025] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            className="mt-3 grid grid-cols-4 gap-2"
            role="group"
            aria-label="Widget style"
          >
            {widgetTemplates.map((item) => {
              const Icon = templateIcons[item.id];
              const selected = item.id === templateId;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Use ${item.name} style`}
                  aria-pressed={selected}
                  onClick={() => setTemplateId(item.id)}
                  className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition sm:text-xs ${
                    selected
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/7 bg-white/[0.025] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                  }`}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.settings.accent }}
                  >
                    <Icon className="h-2.5 w-2.5 text-white" aria-hidden="true" />
                  </span>
                  <span className="hidden truncate sm:inline">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
