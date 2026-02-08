import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

type PlanCard = {
  id: string;
  name: string;
  price: string;
  cycle: string;
  limit: string;
  blurb: string;
  features: string[];
};

const PLAN_CARDS: PlanCard[] = [
  {
    id: "free",
    name: "Free plan",
    price: "$0",
    cycle: "per month",
    limit: "Up to 1,000 messages/month",
    blurb: "Perfect to test the dashboard and launch up to five agents.",
    features: [
      "Up to 5 active agents with embeddable widget",
      "Allowed domains validation",
      "Customizable prompts and branding",
      "Email support with basic SLA",
    ],
  },
  {
    id: "basic",
    name: "Basic plan",
    price: "$29",
    cycle: "per month",
    limit: "Up to 2,000 messages/month",
    blurb: "For agencies launching agents in more than one store.",
    features: [
      "Up to 5 agents in parallel",
      "Priority WooCommerce integration",
      "Alerts when you approach the limit",
      "Monthly usage reports",
    ],
  },
  {
    id: "pro",
    name: "Pro plan",
    price: "$79",
    cycle: "per month",
    limit: "Up to 10,000 messages/month",
    blurb: "For 24/7 operations with high volume and escalations.",
    features: [
      "Up to 15 dedicated agents",
      "Webhook and PayPal subscriptions",
      "Custom escalation routes",
      "Guided onboarding support",
    ],
  },
];

export default async function BillingPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email ?? "";
  const username = email.split("@")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, active_until")
    .eq("id", user.id)
    .single();

  const activePlan = (profile?.plan ?? "free").toLowerCase();
  const activeUntil = profile?.active_until
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.active_until))
    : null;

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      data-oid=".39w0oc"
    >
      {/* Top Navigation / Branding (Same as Dashboard) */}
      <header
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
        data-oid="kiiox28"
      >
        <div
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8"
          data-oid="ltcguf5"
        >
          <div className="flex items-center gap-2" data-oid="lup7jca">
            <div className="h-6 w-6 rounded-md bg-accent" data-oid="-sr0o4c" />
            <span className="font-bold tracking-tight" data-oid="_got.gu">
              AI SAAS
            </span>
            <span
              className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase font-semibold text-[var(--foreground-muted)]"
              data-oid="-qqz_t_"
            >
              Billing
            </span>
          </div>
          <div className="flex items-center gap-4" data-oid="vns_7u:">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--foreground-muted)] hover:text-foreground transition-colors"
              data-oid="z:lkomw"
            >
              Back to Board
            </Link>
            <div
              className="h-8 w-8 rounded-full bg-surface-strong border border-border flex items-center justify-center text-xs font-bold"
              data-oid="-m6dy_f"
            >
              {username[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <section
        className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-8"
        data-oid="1jkl0m8"
      >
        <div
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          data-oid="g-9v5ak"
        >
          <div className="max-w-2xl" data-oid="zhsijyb">
            <h1
              className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground"
              data-oid=".hgno3h"
            >
              Manage your plan
            </h1>
            <p
              className="mt-4 text-lg text-[var(--foreground-muted)]"
              data-oid="370spa0"
            >
              Review your usage limits, upgrade to scale your operations, and
              manage your invoices.
            </p>
          </div>

          <div
            className="ui-card p-4 flex flex-col min-w-[200px] border-accent/20 bg-accent/5"
            data-oid="lfr7di_"
          >
            <span
              className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
              data-oid="mgbyjxc"
            >
              Current Plan
            </span>
            <div className="flex items-center gap-2 mt-1" data-oid=".u1y_t5">
              <div
                className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#34d399]"
                data-oid="p_2gtk7"
              />

              <span
                className="text-xl font-bold text-foreground"
                data-oid="irjruz."
              >
                {activePlan.toUpperCase()}
              </span>
            </div>
            <span
              className="text-xs text-[var(--foreground-muted)] mt-1"
              data-oid="cqvkg.6"
            >
              {activeUntil ? `Renews on ${activeUntil}` : "No expiry date"}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3" data-oid="evdl.md">
          {PLAN_CARDS.map((plan) => {
            const isActive = plan.id === activePlan;
            return (
              <article
                key={plan.id}
                className={`ui-card flex flex-col p-8 transition-all duration-300 hover:bg-surface/50 ${
                  isActive
                    ? "border-accent/40 bg-accent/5 shadow-[0_0_30px_rgba(52,211,153,0.05)]"
                    : "bg-surface/20"
                }`}
                data-oid="0ey.r95"
              >
                <div
                  className="flex items-start justify-between gap-3"
                  data-oid="d36ddpp"
                >
                  <div className="space-y-1" data-oid="sf12kmu">
                    <p
                      className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)] font-semibold"
                      data-oid="14pwjlz"
                    >
                      {plan.limit}
                    </p>
                    <h2
                      className="text-2xl font-bold text-foreground"
                      data-oid="0xmm4w-"
                    >
                      {plan.name}
                    </h2>
                  </div>
                  {isActive && (
                    <span
                      className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                      data-oid="whifer1"
                    >
                      Active
                    </span>
                  )}
                </div>

                <p
                  className="mt-4 text-sm text-[var(--foreground-muted)] h-10"
                  data-oid="14ao_co"
                >
                  {plan.blurb}
                </p>

                <div
                  className="mt-6 flex items-baseline gap-1"
                  data-oid="i0gpooe"
                >
                  <span
                    className="text-4xl font-bold text-foreground"
                    data-oid="51fk.cu"
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]"
                    data-oid="_emf6_-"
                  >
                    {plan.cycle}
                  </span>
                </div>

                <ul className="mt-8 space-y-3 flex-1" data-oid=":-paj00">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]"
                      data-oid="f5o595l"
                    >
                      <svg
                        className="w-5 h-5 text-accent shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        data-oid="tv01fsd"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                          data-oid="x44j-yg"
                        />
                      </svg>
                      <span data-oid="r8qehnf">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="mt-8 pt-6 border-t border-border/50"
                  data-oid="af3y46:"
                >
                  {isActive ? (
                    <button
                      disabled
                      className="w-full rounded-full border border-border bg-surface/50 px-4 py-3 text-sm font-semibold text-[var(--foreground-muted)] cursor-not-allowed opacity-70"
                      data-oid="9if0cqt"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <Link
                      href="/pricing"
                      className="ui-button ui-button--primary w-full justify-center py-3"
                      data-oid="i9aeh0e"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <section
          className="mt-12 ui-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-surface/30"
          data-oid="6ww:vto"
        >
          <div className="space-y-2" data-oid="a:9.6de">
            <h3
              className="text-lg font-semibold text-foreground"
              data-oid="y1c6uif"
            >
              Questions about enterprise billing?
            </h3>
            <p
              className="text-[var(--foreground-muted)] max-w-xl"
              data-oid="wq3jegp"
            >
              We offer custom plans for large agencies, including dedicated
              support, custom integrations, and consolidated billing.
            </p>
          </div>
          <div className="flex flex-wrap gap-4" data-oid="y6ys4b.">
            <a
              href="mailto:atobio459@gmail.com"
              className="ui-button ui-button--ghost"
              data-oid="7il0nl1"
            >
              Contact Support
            </a>
            <Link
              href="/dashboard"
              className="ui-button ui-button--secondary"
              data-oid="xt-9i:w"
            >
              Return to Dashboard
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
