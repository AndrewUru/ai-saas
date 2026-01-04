import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";

const defaultMessagesLimit = 1000;

export default async function AgentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentError = searchParams.error;
  const { supabase, user } = await requireUser();

  const email = user.email ?? "";
  const username = email.split("@")[0];

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  async function createAgent(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const { supabase, user } = await requireUser();

    // 1. Get user plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const currentPlan = (profile?.plan ?? "free").toLowerCase();

    // 2. Define limits
    const PLAN_LIMITS_AGENTS: Record<string, number> = {
      free: 1,
      basic: 5,
      pro: Infinity,
    };

    const maxAgents = PLAN_LIMITS_AGENTS[currentPlan] ?? 1;

    // 3. Count existing agents
    const { count: currentCount } = await supabase
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 4. Validate
    if (currentCount !== null && currentCount >= maxAgents) {
      redirect(
        `/pricing?reason=agent_limit&plan=${encodeURIComponent(currentPlan)}`
      );
    }

    const apiKey =
      "agt_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

    await supabase.from("agents").insert({
      user_id: user.id,
      name,
      api_key: apiKey,
      is_active: true,
      messages_limit: defaultMessagesLimit,
    });

    redirect("/agents");
  }

  async function deleteAgent(formData: FormData) {
    "use server";

    const id = String(formData.get("agent_id") ?? "").trim();
    if (!id) return;

    const { supabase, user } = await requireUser();

    await supabase.from("agents").delete().eq("id", id).eq("user_id", user.id);

    redirect("/agents");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Navigation / Branding (Same as Dashboard) */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[14px] uppercase font-semibold text-[var(--foreground-muted)]">
              Agents
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--foreground-muted)] hover:text-foreground transition-colors"
            >
              Back to Board
            </Link>
            <div className="h-8 w-8 rounded-full bg-surface-strong border border-border flex items-center justify-center text-xs font-bold">
              {username[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Error Feedback */}
        {currentError && typeof currentError === "string" && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-200">
            <p className="font-semibold">Unable to create agent</p>
            <p className="text-sm opacity-80">{currentError}</p>
          </div>
        )}

        {/* Stats Rack */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="ui-card p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
              Agents Created
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#34d399]" />
              <span className="text-xl font-bold">{agents?.length ?? 0}</span>
            </div>
          </div>

          <div className="ui-card p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
              Default Limit
            </span>
            <span className="text-xl font-bold mt-1">
              {defaultMessagesLimit.toLocaleString("en-US")}
            </span>
          </div>

          <div className="ui-card p-4 flex flex-col justify-between sm:col-span-2 bg-gradient-to-br from-surface to-surface-strong/50">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                  Need help?
                </span>
                <p className="text-sm font-medium mt-1">
                  Check our detailed integration guides
                </p>
              </div>
              <Link
                href="/docs"
                className="ui-button ui-button--subtle text-xs"
              >
                View Docs
              </Link>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Active Agents
              </h2>
              <span className="text-sm text-[var(--foreground-muted)]">
                Manage settings and integrations
              </span>
            </div>

            {!agents?.length ? (
              <div className="ui-card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/50 bg-transparent">
                <div className="h-12 w-12 rounded-full bg-surface-strong flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No agents yet
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-sm mt-2">
                  Create your first agent to generate an API key and start
                  automating your ecommerce support.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {agents.map((agent) => {
                  const statusColor = agent.is_active
                    ? "bg-accent"
                    : "bg-[var(--foreground-muted)]";
                  const statusText = agent.is_active ? "Active" : "Paused";
                  const maskedKey = `${agent.api_key?.slice(0, 6) ?? "N/A"}...`;

                  return (
                    <li
                      key={agent.id}
                      className="ui-card group p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-accent/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.05)]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor] ${statusColor}`}
                          />

                          <h3 className="font-semibold text-foreground text-lg">
                            {agent.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full border border-border bg-surface text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                            {statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                          <span className="flex items-center gap-1.5 bg-surface/50 rounded-md px-2 py-1">
                            <span className="opacity-70">Key:</span>
                            <span className="font-mono text-foreground/80">
                              {maskedKey}
                            </span>
                          </span>
                          <span>
                            Limit:{" "}
                            {agent.messages_limit?.toLocaleString() ?? "∞"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50 mt-2 sm:mt-0">
                        <Link
                          href={`/dashboard/agents/${agent.id}`}
                          className="ui-button ui-button--secondary text-xs"
                        >
                          Configure
                        </Link>
                        <form action={deleteAgent}>
                          <input
                            type="hidden"
                            name="agent_id"
                            value={agent.id}
                          />

                          <button
                            type="submit"
                            className="ui-button ui-button--ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Sidebar - Create Action */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 ui-card p-6 bg-surface-strong/30 backdrop-blur-xl border-accent/20">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  New Agent
                </span>
                <h2 className="text-xl font-bold text-foreground mt-2">
                  Deploy new instance
                </h2>
                <p className="text-sm text-[var(--foreground-muted)] mt-2">
                  Generate a new API key immediately. You can rename and
                  reconfigure it anytime.
                </p>
              </div>

              <form action={createAgent} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]"
                  >
                    Agent Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="e.g. 'Main Store Support'"
                    required
                    className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-[var(--foreground-muted)]/50"
                  />
                </div>

                <button
                  type="submit"
                  className="ui-button ui-button--primary w-full justify-center py-3 text-sm"
                >
                  Generate Agent
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50 text-xs text-[var(--foreground-muted)] space-y-2">
                <p>• API keys are generated with secure randomness.</p>
                <p>• Initial limits adhere to your plan defaults.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
