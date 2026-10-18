import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";

import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.pricing.meta.title };
}

export default async function PricingPage() {
  const { t } = await getI18n();
  const p = t.pricing;
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main className="relative flex-1 bg-background text-foreground">
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link
          href="/dashboard"
          className="ui-button ui-button--subtle mb-8 w-fit px-0 text-xs"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {p.back}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)] lg:items-end">
          <div className="space-y-5">
            <p className="ui-badge w-fit">{p.badge}</p>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                {p.title}
              </h1>

              <p className="max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
                {p.intro}
              </p>
            </div>
          </div>

          <div className="ui-card ui-card--strong p-5">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Metric icon={MessageSquare} label={p.metrics.includedLabel} value={p.metrics.includedValue} />
              <Metric icon={ShieldCheck} label={p.metrics.checkoutLabel} value={p.metrics.checkoutValue} />
              <Metric icon={CheckCircle2} label={p.metrics.setupLabel} value={p.metrics.setupValue} />
            </div>
          </div>
        </div>

        <PricingCards clientId={paypalClientId} />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title={p.includedTitle} items={p.included} />

          <div className="ui-card p-6 text-sm text-[var(--foreground-muted)]">
            <p className="text-sm font-semibold text-foreground">
              {p.testingTitle}
            </p>
            <p className="mt-2 text-xs leading-5">
              {p.testingBody}
            </p>
          </div>

          <InfoCard
            title={p.upgradeTitle}
            items={p.proBenefits}
            highlighted
          />
        </div>

        <div className="ui-card mt-8 p-6 text-sm text-[var(--foreground-muted)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {p.customTitle}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {p.customBody}
              </p>
            </div>
            <Link
              href="/contact"
              className="ui-button ui-button--secondary shrink-0"
            >
              {p.talkToSales}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
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
          ? "ui-card border-accent/30 bg-accent/10 p-6 text-sm text-foreground"
          : "ui-card p-6 text-sm text-[var(--foreground-muted)]"
      }
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul
        className={
          highlighted
            ? "mt-3 space-y-2 text-xs text-neutral-100/80"
            : "mt-3 space-y-2 text-xs text-[var(--foreground-muted)]"
        }
      >
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
