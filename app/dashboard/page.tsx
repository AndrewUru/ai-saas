// C:\ai-saas\app\dashboard\page.tsx
import Link from "next/link";
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

  type Profile = { plan: string | null; active_until: string | null };

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("plan, active_until")
        .eq("id", user.id)
        .single<Profile>()
    : { data: null };

  const plan = (profile?.plan ?? "free").toLowerCase();
  const planLabel = plan.toUpperCase();
  const planLimitLabel = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const activeUntil = profile?.active_until
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.active_until))
    : "No expiry";

  return (
    <>
      {/* Stats Rack / HUD */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4" data-oid="8f-iagq">
        <div
          className="ui-card p-4 flex flex-col justify-between"
          data-oid="ku2fkpl"
        >
          <span
            className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
            data-oid="gauvn3s"
          >
            Current Plan
          </span>
          <div className="flex items-center gap-2 mt-1" data-oid="ttj5qg_">
            <div
              className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#34d399]"
              data-oid=":8v49vy"
            />

            <span className="text-lg font-bold" data-oid="vekm6xm">
              {planLabel}
            </span>
          </div>
        </div>

        <div
          className="ui-card p-4 flex flex-col justify-between"
          data-oid="m66-p7x"
        >
          <span
            className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
            data-oid="bclv8vv"
          >
            Status
          </span>
          <span className="text-lg font-bold mt-1" data-oid="9seexq0">
            Active
          </span>
        </div>

        <div
          className="ui-card p-4 flex flex-col justify-between"
          data-oid="2malhn1"
        >
          <span
            className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
            data-oid="66tp065"
          >
            Renewal
          </span>
          <span
            className="text-lg font-bold mt-1 text-[var(--foreground-muted)]"
            data-oid="qq6guxp"
          >
            {activeUntil}
          </span>
        </div>

        <div
          className="ui-card p-4 flex flex-col justify-between bg-accent/10 border-accent/20"
          data-oid="qz.rxot"
        >
          <span
            className="text-[10px] uppercase tracking-wider text-accent"
            data-oid="7o-5-ga"
          >
            Quick action
          </span>
          <Link
            href="/dashboard/agents"
            className="text-sm font-semibold text-accent hover:underline decoration-accent/50 underline-offset-4 mt-1"
            data-oid="zp9j0t_"
          >
            + Deploy new agent
          </Link>
        </div>
      </div>

      {/* Main Board Grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        data-oid="kd.gvx:"
      >
        {/* Canvas - Main Content */}
        <div
          className="lg:col-span-8 xl:col-span-9 space-y-6"
          data-oid="s9-x2t."
        >
          <AgentsSection planLimitLabel={planLimitLabel} data-oid="k27wgxa" />
        </div>

        {/* Sidebar (right) - Quick Actions & Info */}
        <aside
          className="lg:col-span-4 xl:col-span-3 space-y-6"
          data-oid="x013imz"
        >
          <div
            className="ui-card p-6 space-y-4 sticky top-24"
            data-oid="b68k574"
          >
            <h3 className="font-semibold text-foreground" data-oid="gld:99c">
              Platform Status
            </h3>

            <div className="space-y-3" data-oid="8l6._jb">
              <div
                className="flex items-center justify-between text-sm"
                data-oid="cimt46l"
              >
                <span
                  className="text-[var(--foreground-muted)]"
                  data-oid="w7j:dqo"
                >
                  API Uptime
                </span>
                <span className="text-accent" data-oid="_rqyttb">
                  99.9%
                </span>
              </div>

              <div
                className="flex items-center justify-between text-sm"
                data-oid="upi7y:-"
              >
                <span
                  className="text-[var(--foreground-muted)]"
                  data-oid="0w6z1ld"
                >
                  Engine
                </span>
                <span className="text-accent" data-oid="6bce5wq">
                  v2.4.0
                </span>
              </div>

              <div className="h-px bg-border my-2" data-oid="fv62fch" />

              <div
                className="flex items-center justify-between text-sm"
                data-oid="qslxn6-"
              >
                <span
                  className="text-[var(--foreground-muted)]"
                  data-oid="o_9h1ws"
                >
                  Response Time
                </span>
                <span className="text-foreground" data-oid="-_w-7ja">
                  120ms
                </span>
              </div>
            </div>

            <div className="pt-4" data-oid="8d-.i9a">
              <Link
                href="/dashboard/billing"
                className="ui-button ui-button--secondary w-full justify-center"
                data-oid="agczgj."
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
