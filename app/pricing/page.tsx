import PricingCards from "@/components/PricingCards";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";

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
    <main className="relative flex-1 bg-background text-foreground">
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link
          href="/dashboard"
          className="ui-button ui-button--subtle mb-8 w-fit px-0 text-xs"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)] lg:items-end">
          <div className="space-y-5">
            <p className="ui-badge w-fit">Pricing</p>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Simple plans for AI commerce agents.
              </h1>

              <p className="max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
                Start free, connect your store, and upgrade when your agents
                need more volume, customization, and a cleaner client-facing
                experience.
              </p>
            </div>
          </div>

          <div className="ui-card ui-card--strong p-5">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Metric icon={MessageSquare} label="Included" value="AI widget" />
              <Metric icon={ShieldCheck} label="Checkout" value="PayPal secure" />
              <Metric icon={CheckCircle2} label="Setup" value="No contracts" />
            </div>
          </div>
        </div>

        <PricingCards clientId={paypalClientId} />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="What is included" items={included} />

          <div className="ui-card p-6 text-sm text-[var(--foreground-muted)]">
            <p className="text-sm font-semibold text-foreground">
              Best for testing
            </p>
            <p className="mt-2 text-xs leading-5">
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

        <div className="ui-card mt-8 p-6 text-sm text-[var(--foreground-muted)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Need custom limits or agency features?
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">
                We can tailor agent caps, message volumes, onboarding, and
                white-label reporting.
              </p>
            </div>
            <Link
              href="/contact"
              className="ui-button ui-button--secondary shrink-0"
            >
              Talk to sales
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
            ? "mt-3 space-y-2 text-xs text-emerald-100/80"
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
