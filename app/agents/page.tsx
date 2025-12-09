import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

const defaultMessagesLimit = 1000;

export default async function AgentsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const currentError = searchParams.error;
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  async function createAgent(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

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
      const errorMsg =
        currentPlan === "free" || currentPlan === "basic"
          ? `Plan ${currentPlan} limit reached (${maxAgents} agent${
              maxAgents === 1 ? "" : "s"
            }). Upgrade to create more.`
          : `Limit reached (${maxAgents} agents).`;

      redirect(`/agents?error=${encodeURIComponent(errorMsg)}`);
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

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("agents").delete().eq("id", id).eq("user_id", user.id);

    redirect("/agents");
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100"
      data-oid="5jh_:cu"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_60%)]"
        data-oid="a_zp.si"
      />

      <section
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-16 md:px-10 lg:px-16"
        data-oid="v_71yzg"
      >
        {currentError && typeof currentError === "string" && (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-6 py-4 text-red-200">
            <p className="font-semibold">Unable to create agent</p>
            <p className="text-sm">{currentError}</p>
          </div>
        )}

        <header
          className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] md:items-center md:gap-8"
          data-oid="30m1z5p"
        >
          <div className="space-y-4" data-oid="fxfe3nk">
            <p
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200"
              data-oid="p4h.8zd"
            >
              Agents center
            </p>
            <h1
              className="text-3xl font-semibold leading-tight sm:text-4xl"
              data-oid="86qyzy7"
            >
              Design and control your commerce agents
            </h1>
            <p
              className="max-w-2xl text-sm text-slate-300 sm:text-base"
              data-oid="3vd.8k7"
            >
              Verify integrations, copy API keys, and adjust message limits in
              seconds. Each agent can connect to a different WooCommerce site.
            </p>
            <div className="flex flex-wrap gap-3" data-oid="8fjee:-">
              <Link
                href="#create-agent"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                data-oid=".h58guz"
              >
                Create agent
              </Link>
              <Link
                href="/integrations/woo"
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                data-oid="rhpbvm:"
              >
                Review integrations
              </Link>
            </div>
          </div>
          <div
            className="grid gap-3 sm:grid-cols-2 md:grid-cols-1"
            data-oid="wel29da"
          >
            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-inner shadow-slate-900/60"
              data-oid="7v:rynw"
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
                data-oid="b6_i.ol"
              >
                Registered agents
              </p>
              <p
                className="mt-2 text-2xl font-semibold text-white"
                data-oid="idhu1lp"
              >
                {agents?.length ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-400" data-oid="jqc5wy_">
                Keep your agents under control for fast responses.
              </p>
            </div>
            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-inner shadow-slate-900/60"
              data-oid="8vkl_uy"
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
                data-oid="1idyumh"
              >
                Initial limit
              </p>
              <p
                className="mt-2 text-2xl font-semibold text-white"
                data-oid="oq-q.47"
              >
                {defaultMessagesLimit.toLocaleString("en-US")} messages
              </p>
              <p className="mt-1 text-xs text-slate-400" data-oid="huuc0ii">
                Adjust the limit per agent according to your plan.
              </p>
            </div>
          </div>
        </header>

        <div
          className="
    grid gap-10
    lg:grid-cols-[minmax(0,1.5fr)_360px]
    xl:grid-cols-[minmax(0,1.8fr)_380px]
    2xl:grid-cols-[minmax(0,2fr)_420px]
    w-full
  "
          data-oid="glokzyo"
        >
          <section className="space-y-6 min-w-0" data-oid="o_oj23d">
            <div
              className="flex flex-wrap items-start justify-between gap-4"
              data-oid="trh676o"
            >
              <div className="space-y-1" data-oid="51sw5hr">
                <h2
                  className="text-xl font-semibold text-white"
                  data-oid="vuq6jdj"
                >
                  Your active agents
                </h2>
                <p className="text-sm text-slate-300" data-oid="epvmjeg">
                  Create agents segmented by brand, language, or catalog and
                  configure them from their detail page.
                </p>
              </div>
              <Link
                href="#create-agent"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
                data-oid="u.kacd7"
              >
                New agent
              </Link>
            </div>

            {!agents?.length ? (
              <div
                className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-300"
                data-oid="ag-.qxa"
              >
                <p className="font-medium text-white" data-oid="ytd-n0b">
                  You don&apos;t have any agents configured yet.
                </p>
                <p className="mt-2" data-oid="vm05z.f">
                  Create your first agent to generate unique API keys and start
                  automating replies in your ecommerce.
                </p>
                <Link
                  href="#create-agent"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  data-oid="z_1sk7."
                >
                  Create agent now
                </Link>
              </div>
            ) : (
              <ul className="space-y-4 min-w-0" data-oid="m5:5ek4">
                {agents.map((agent) => {
                  const statusColor = agent.is_active
                    ? "bg-emerald-400"
                    : "bg-slate-500";
                  const statusText = agent.is_active ? "Active" : "Paused";
                  const maskedKey = `${agent.api_key?.slice(0, 6) ?? "N/A"}...`;

                  const limit = agent.messages_limit ?? defaultMessagesLimit;

                  return (
                    <li
                      key={agent.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg shadow-slate-900/50 sm:flex-row sm:items-center sm:justify-between"
                      data-oid="6ty-ryt"
                    >
                      <div className="space-y-2 min-w-0" data-oid="dfy9ezd">
                        <div
                          className="flex flex-wrap items-center gap-2"
                          data-oid="aoin:lu"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
                            data-oid="9r8jy3e"
                          />

                          <span
                            className="text-base font-semibold text-white"
                            data-oid="ye_cpzf"
                          >
                            {agent.name}
                          </span>
                          <span
                            className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-400"
                            data-oid="4a4.5ho"
                          >
                            {statusText}
                          </span>
                        </div>
                        <div
                          className="flex flex-wrap gap-2 text-xs text-slate-400"
                          data-oid=".ak-dik"
                        >
                          <span
                            className="rounded-full bg-slate-900/80 px-2 py-1"
                            data-oid="orttp7t"
                          >
                            API Key:{" "}
                            <span
                              className="font-mono text-slate-100"
                              data-oid="rsxoe_4"
                            >
                              {maskedKey}
                            </span>
                          </span>
                          <span
                            className="rounded-full bg-slate-900/80 px-2 py-1"
                            data-oid="5z3-fuy"
                          >
                            Limit: {limit.toLocaleString("en-US")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3" data-oid="p_svlla">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                          data-oid="190mxdo"
                        >
                          Configure
                        </Link>
                        <form
                          action={deleteAgent}
                          className="contents"
                          data-oid="bbzda5x"
                        >
                          <input
                            type="hidden"
                            name="agent_id"
                            value={agent.id}
                            data-oid="ujus.q4"
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-red-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-100 transition hover:border-red-400 hover:text-red-200"
                            data-oid="x9a-uqq"
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
          </section>

          <aside
            id="create-agent"
            className="min-w-0 space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
            data-oid="d0epq8q"
          >
            <div className="space-y-2" data-oid="-rw3ysw">
              <p
                className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200"
                data-oid="mumbgs7"
              >
                New agent
              </p>
              <h2
                className="text-lg font-semibold text-white"
                data-oid="va651vg"
              >
                Generate an API key in seconds
              </h2>
              <p className="text-sm text-slate-300" data-oid="gz7oo7n">
                Give it a descriptive name so you can quickly identify the
                channel or associated brand. You can edit limits and credentials
                later.
              </p>
            </div>

            <form action={createAgent} className="space-y-4" data-oid="rmavgwk">
              <div className="space-y-2" data-oid="-b5a8lx">
                <label
                  htmlFor="agent-name"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                  data-oid="jbdwzey"
                >
                  Agent name
                </label>
                <input
                  id="agent-name"
                  name="name"
                  placeholder="WooCommerce Support"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  required
                  data-oid="-kfcof_"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                data-oid="djiq7ej"
              >
                Generate agent
              </button>
            </form>

            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400"
              data-oid="66r:fy:"
            >
              <p data-oid="igsb8.2">
                The embed snippet is generated automatically on the agent page
                with its API key included; you don&apos;t need to copy it
                manually.
              </p>
            </div>

            <div
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400"
              data-oid="hcx8eh1"
            >
              <p data-oid="t09fn7w">
                Each agent starts with a limit of{" "}
                {defaultMessagesLimit.toLocaleString("en-US")} messages. Adjust
                the value as your plan or sales volume grows.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
