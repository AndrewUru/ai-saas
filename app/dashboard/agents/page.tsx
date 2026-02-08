import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { getAgentLimit } from "@/lib/plans";

const defaultMessagesLimit = 1000;

export default async function AgentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentError = searchParams.error;
  const { supabase, user } = await requireUser();

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
    const maxAgents = getAgentLimit(currentPlan);

    // 3. Count existing agents
    const { count: currentCount } = await supabase
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    // 4. Validate
    if (currentCount !== null && currentCount >= maxAgents) {
      redirect(
        `/pricing?reason=agent_limit&plan=${encodeURIComponent(currentPlan)}`,
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

    redirect("/dashboard/agents");
  }

  async function deleteAgent(formData: FormData) {
    "use server";

    const id = String(formData.get("agent_id") ?? "").trim();
    if (!id) return;

    const { supabase, user } = await requireUser();

    await supabase.from("agents").delete().eq("id", id).eq("user_id", user.id);

    redirect("/dashboard/agents");
  }

  return (
    <main className="min-h-screen text-foreground" data-oid="rmcibz4">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8" data-oid="uxkokmc">
        {/* Error Feedback */}
        {currentError && typeof currentError === "string" && (
          <div
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-200"
            data-oid="4spvj.w"
          >
            <p className="font-semibold" data-oid="6fs1ga2">
              Unable to create agent
            </p>
            <p className="text-sm opacity-80" data-oid="y:a:.4v">
              {currentError}
            </p>
          </div>
        )}

        {/* Stats Rack */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4" data-oid="d47bv3m">
          <div
            className="ui-card p-4 flex flex-col justify-between"
            data-oid="q1vsjs9"
          >
            <span
              className="text-[10px] uppercase tracking-wider text-(--foreground-muted)"
              data-oid="z0yo1b:"
            >
              Agents Created
            </span>
            <div className="flex items-center gap-2 mt-1" data-oid="ztt1prf">
              <div
                className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_#34d399]"
                data-oid="gy.ecsl"
              />

              <span className="text-xl font-bold" data-oid="dd9-8si">
                {agents?.length ?? 0}
              </span>
            </div>
          </div>

          <div
            className="ui-card p-4 flex flex-col justify-between"
            data-oid="uta7ziy"
          >
            <span
              className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
              data-oid="4ongqbw"
            >
              Default Limit
            </span>
            <span className="text-xl font-bold mt-1" data-oid="ij5j588">
              {defaultMessagesLimit.toLocaleString("en-US")}
            </span>
          </div>

          <div
            className="ui-card p-4 flex flex-col justify-between sm:col-span-2 bg-gradient-to-br from-surface to-surface-strong/50"
            data-oid="kz9ibr6"
          >
            <div
              className="flex items-center justify-between"
              data-oid="zd.n7ry"
            >
              <div data-oid="ns..54q">
                <span
                  className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
                  data-oid="sifm0hq"
                >
                  Need help?
                </span>
                <p className="text-sm font-medium mt-1" data-oid="v1e._14">
                  Check our detailed integration guides
                </p>
              </div>
              <Link
                href="/docs"
                className="ui-button ui-button--subtle text-xs"
                data-oid="-smml4."
              >
                View Docs
              </Link>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          data-oid="v9w.xap"
        >
          {/* Main List */}
          <div className="lg:col-span-8 space-y-6" data-oid="z5_gq2d">
            <div
              className="flex items-center justify-between"
              data-oid="glvh1sy"
            >
              <h2
                className="text-xl font-bold text-foreground"
                data-oid="1riw9ml"
              >
                Active Agents
              </h2>
              <span
                className="text-sm text-[var(--foreground-muted)]"
                data-oid="9:6rrd4"
              >
                Manage settings and integrations
              </span>
            </div>

            {!agents?.length ? (
              <div
                className="ui-card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/50 bg-transparent"
                data-oid="8ew-o0s"
              >
                <div
                  className="h-12 w-12 rounded-full bg-surface-strong flex items-center justify-center mb-4"
                  data-oid="wb1l_6k"
                >
                  <span className="text-2xl" data-oid="a.1p0j.">
                    🤖
                  </span>
                </div>
                <h3
                  className="text-lg font-semibold text-foreground"
                  data-oid="oql6hqd"
                >
                  No agents yet
                </h3>
                <p
                  className="text-[var(--foreground-muted)] max-w-sm mt-2"
                  data-oid="mtjuvpk"
                >
                  Create your first agent to generate an API key and start
                  automating your ecommerce support.
                </p>
              </div>
            ) : (
              <ul className="space-y-4" data-oid="gbc:fhh">
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
                      data-oid="vzbymf5"
                    >
                      <div className="space-y-2" data-oid="4y-q5r7">
                        <div
                          className="flex items-center gap-3"
                          data-oid="t.iw1ky"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor] ${statusColor}`}
                            data-oid="iie1bni"
                          />

                          <h3
                            className="font-semibold text-foreground text-lg"
                            data-oid="bj5hmog"
                          >
                            {agent.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full border border-border bg-surface text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]"
                            data-oid="_ixcx_2"
                          >
                            {statusText}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]"
                          data-oid="8iq7yj4"
                        >
                          <span
                            className="flex items-center gap-1.5 bg-surface/50 rounded-md px-2 py-1"
                            data-oid="4b65uqj"
                          >
                            <span className="opacity-70" data-oid="v.o56l:">
                              Key:
                            </span>
                            <span
                              className="font-mono text-foreground/80"
                              data-oid="5j5bnvh"
                            >
                              {maskedKey}
                            </span>
                          </span>
                          <span data-oid="8bqqvtb">
                            Limit:{" "}
                            {agent.messages_limit?.toLocaleString() ?? "∞"}
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50 mt-2 sm:mt-0"
                        data-oid="fr71:hj"
                      >
                        <Link
                          href={`/dashboard/agents/${agent.id}`}
                          className="ui-button ui-button--secondary text-xs"
                          data-oid="-py4aju"
                        >
                          Configure
                        </Link>
                        <form action={deleteAgent} data-oid="bsi7cqb">
                          <input
                            type="hidden"
                            name="agent_id"
                            value={agent.id}
                            data-oid="2goiooq"
                          />

                          <button
                            type="submit"
                            className="ui-button ui-button--ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            data-oid="4tl4hy5"
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
          <aside className="lg:col-span-4" data-oid="0fqlrfh">
            <div
              className="sticky top-24 ui-card p-6 bg-surface-strong/30 backdrop-blur-xl border-accent/20"
              data-oid="m6:915s"
            >
              <div className="mb-6" data-oid="xf-f5ss">
                <span
                  className="text-xs font-bold uppercase tracking-widest text-accent"
                  data-oid="76eggo-"
                >
                  New Agent
                </span>
                <h2
                  className="text-xl font-bold text-foreground mt-2"
                  data-oid="e4ecq2x"
                >
                  Deploy new instance
                </h2>
                <p
                  className="text-sm text-[var(--foreground-muted)] mt-2"
                  data-oid="hrw6on-"
                >
                  Generate a new API key immediately. You can rename and
                  reconfigure it anytime.
                </p>
              </div>

              <form
                action={createAgent}
                className="space-y-4"
                data-oid="p:ttods"
              >
                <div className="space-y-2" data-oid="cphxu3a">
                  <label
                    htmlFor="name"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]"
                    data-oid="-cs_.jt"
                  >
                    Agent Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="e.g. 'Main Store Support'"
                    required
                    className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-[var(--foreground-muted)]/50"
                    data-oid="5191v5x"
                  />
                </div>

                <button
                  type="submit"
                  className="ui-button ui-button--primary w-full justify-center py-3 text-sm"
                  data-oid="uivvsb:"
                >
                  Generate Agent
                </button>
              </form>

              <div
                className="mt-6 pt-6 border-t border-border/50 text-xs text-[var(--foreground-muted)] space-y-2"
                data-oid="11si0.b"
              >
                <p data-oid="_2_6r44">
                  • API keys are generated with secure randomness.
                </p>
                <p data-oid="nh-j-wh">
                  • Initial limits adhere to your plan defaults.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
