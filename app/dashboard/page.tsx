import Link from "next/link";
import { redirect } from "next/navigation";
import AgentsSection from "./AgentsSection";
import { createServer } from "@/lib/supabase/server";

const PLAN_LIMITS: Record<string, string> = {
  free: "1,000",
  basic: "2,000",
  pro: "10,000",
};

export default async function DashboardPage() {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 👉 sacar nombre a partir del email
  const email = user.email ?? "";
  const username = email.split("@")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, active_until")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free").toLowerCase();
  const planLabel = plan.toUpperCase();
  const planLimitLabel = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const activeUntil = profile?.active_until
    ? new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(profile.active_until))
    : "No date";

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100"
      data-oid="wxnl533"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]"
        data-oid="t21uf9s"
      />

      <section
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-16 md:px-10 lg:px-16"
        data-oid="27-sl1_"
      >
        <header
          className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur md:flex md:items-center md:justify-between md:space-y-0"
          data-oid="2x:zbka"
        >
          <div data-oid="c01_ntz">
            <p
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200"
              data-oid="ubqklc1"
            >
              Main dashboard
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Hello, {username}
            </h1>
            <p
              className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base"
              data-oid="eb7_3y2"
            >
              Manage your agents, check your plan status, and share the widget
              with your stores from a single place.
            </p>
          </div>
          <div
            className="flex flex-col gap-3 text-sm text-slate-300 md:text-right"
            data-oid="y.13oo3"
          >
            <div data-oid="ytx_i6c">
              <span
                className="text-xs uppercase tracking-[0.28em] text-emerald-300"
                data-oid="880u9zy"
              >
                Active plan
              </span>
              <div
                className="text-lg font-semibold text-white"
                data-oid="bwi0sb7"
              >
                {planLabel}
              </div>
            </div>
            <div data-oid="u1i-_uf">
              <span
                className="text-xs uppercase tracking-[0.28em] text-emerald-300"
                data-oid="0y88hol"
              >
                Active until
              </span>
              <div
                className="text-lg font-semibold text-white"
                data-oid="yv.lxc5"
              >
                {activeUntil}
              </div>
            </div>
          </div>
        </header>

        <div
          className="
    grid gap-10
    lg:grid-cols-[minmax(0,1.4fr)_320px]
    xl:grid-cols-[minmax(0,1.7fr)_360px]
    2xl:grid-cols-[minmax(0,2fr)_420px]
    w-full
  "
          data-oid=":d3cz7i"
        >
          {/* MAIN COLUMN */}
          <div className="w-full min-w-0" data-oid="5vsj:9n">
            <AgentsSection planLimitLabel={planLimitLabel} data-oid="nyina8d" />
          </div>

          {/* ASIDE */}
          <aside className="w-full space-y-6 min-w-0" data-oid="58_r2lk">
            <article
              className="ui-card ui-card--padded ui-card--strong text-emerald-100"
              data-oid="ooy9qqu"
            >
              <h3 className="text-lg font-semibold" data-oid=":1.fum_">
                Plan & billing
              </h3>

              <p className="mt-2 text-sm" data-oid="b:ndu2s">
                Keep your plan up to date to continue sending messages without
                interruptions. Update your subscription whenever you need.
              </p>

              <Link
                href="/billing"
                className="
          mt-4 inline-flex items-center justify-center
          rounded-full bg-white px-4 py-2
          text-sm font-semibold text-slate-950
          transition hover:bg-slate-100
        "
                data-oid="ncd1973"
              >
                Manage subscription
              </Link>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
