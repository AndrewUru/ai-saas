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
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.active_until))
    : "No expiry";

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Navigation / Branding */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-accent" />
            <span className="font-bold tracking-tight">AI SAAS</span>
            <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase font-semibold text-[var(--foreground-muted)]">
              Board
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/docs" 
              className="text-sm font-medium text-[var(--foreground-muted)] hover:text-foreground transition-colors"
            >
               Documentation
            </Link>
            <div className="h-8 w-8 rounded-full bg-surface-strong border border-border flex items-center justify-center text-xs font-bold">
              {username[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        
        {/* Stats Rack / HUD */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="ui-card p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Current Plan</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#34d399]" />
              <span className="text-lg font-bold">{planLabel}</span>
            </div>
          </div>
          
          <div className="ui-card p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Status</span>
            <span className="text-lg font-bold mt-1">Active</span>
          </div>
          
           <div className="ui-card p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Renewal</span>
            <span className="text-lg font-bold mt-1 text-[var(--foreground-muted)]">{activeUntil}</span>
          </div>

          <div className="ui-card p-4 flex flex-col justify-between bg-accent/10 border-accent/20">
            <span className="text-[10px] uppercase tracking-wider text-accent">Quick action</span>
            <Link href="/agents" className="text-sm font-semibold text-accent hover:underline decoration-accent/50 underline-offset-4 mt-1">
              + Deploy new agent
            </Link>
          </div>
        </div>

        {/* Main Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Canvas - Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
             <AgentsSection planLimitLabel={planLimitLabel} />
          </div>

          {/* Sidebar - Quick Actions & Info */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="ui-card p-6 space-y-4 sticky top-24">
              <h3 className="font-semibold text-foreground">Platform Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground-muted)]">API Uptime</span>
                  <span className="text-accent">99.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground-muted)]">Engine</span>
                  <span className="text-accent">v2.4.0</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--foreground-muted)]">Response Time</span>
                   <span className="text-foreground">120ms</span>
                </div>
              </div>

              <div className="pt-4">
                 <Link
                  href="/billing"
                  className="ui-button ui-button--secondary w-full justify-center"
                >
                  Manage Subscription
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
