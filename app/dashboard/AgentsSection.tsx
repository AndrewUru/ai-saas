"use client";

import Link from "next/link";
import { useAgents } from "./hooks/useAgents";

type Props = {
  planLimitLabel: string;
};

export default function AgentsSection({ planLimitLabel }: Props) {
  const { data, isLoading, isError } = useAgents();
  const agents = data ?? [];
  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent) => agent.is_active).length;

  return (
    <section className="space-y-6" data-oid=".zc76.q">
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-3" data-oid="kqndrms">
        <StatCard
          label="Agents created"
          value={isLoading ? "-" : totalAgents}
          helper={
            isLoading
              ? "Loading..."
              : totalAgents === 0
                ? "No agents yet"
                : "Ready in WooCommerce"
          }
          data-oid="4fx6r9g"
        />

        <StatCard
          label="Active agents"
          value={isLoading ? "-" : activeAgents}
          helper={
            isLoading
              ? "Checking..."
              : activeAgents === totalAgents
                ? "All active"
                : "Some are paused"
          }
          data-oid="a5x61qk"
        />

        <StatCard
          label="Message limit"
          value={planLimitLabel}
          helper="Monthly capacity"
          data-oid="66d8esu"
        />
      </div>

      <div
        className="ui-card flex flex-col p-6 backdrop-blur-md bg-surface/40"
        data-oid="ok6u1nk"
      >
        <div
          className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 mb-6"
          data-oid="qapjgxt"
        >
          <div data-oid="usibyj2">
            <h2
              className="text-xl font-semibold text-foreground"
              data-oid="7p.vobk"
            >
              Your agents
            </h2>
            <p
              className="mt-1 text-sm text-[var(--foreground-muted)]"
              data-oid="r8m-n:8"
            >
              Manage integrations and performance
            </p>
          </div>
          <Link
            href="/dashboard/agents"
            className="ui-button ui-button--ghost text-xs"
            data-oid="zjyrsqb"
          >
            View all agents
          </Link>
        </div>

        {isError && (
          <div
            className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200"
            data-oid="-627hcz"
          >
            Failed to load agents. Please refresh.
          </div>
        )}

        {!isError && totalAgents === 0 && !isLoading && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center"
            data-oid="quy4f.0"
          >
            <p className="font-medium text-foreground" data-oid="wb26ygt">
              No agents configured
            </p>
            <p
              className="mt-2 text-sm text-[var(--foreground-muted)] max-w-sm"
              data-oid="98vegj."
            >
              Create your first agent to connect WooCommerce and start replying
              to chats automatically.
            </p>
            <Link
              href="/dashboard/agents"
              className="mt-6 ui-button ui-button--primary"
              data-oid="y8nbbpt"
            >
              Create agent
            </Link>
          </div>
        )}

        {!isError && totalAgents > 0 && (
          <ul className="space-y-3" data-oid="7n9yujv">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <AgentSkeleton key={index} data-oid="2ja:3sl" />
                ))
              : agents.slice(0, 5).map((agent) => {
                  const statusColor = agent.is_active
                    ? "bg-accent"
                    : "bg-[var(--foreground-muted)]";
                  const statusText = agent.is_active ? "Active" : "Paused";

                  return (
                    <li
                      key={agent.id}
                      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface/30 p-4 transition-all hover:bg-surface/50 hover:border-accent/20 sm:flex-row sm:items-center sm:justify-between"
                      data-oid=":moz-zc"
                    >
                      <div className="space-y-1" data-oid="e60.cdk">
                        <div
                          className="flex items-center gap-3"
                          data-oid="_hafvj2"
                        >
                          <span
                            className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${statusColor}`}
                            data-oid="bdtdajw"
                          />

                          <span
                            className="text-sm font-semibold text-foreground"
                            data-oid="9-2p4er"
                          >
                            {agent.name || "Unnamed Agent"}
                          </span>
                          <span
                            className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
                            data-oid="93d.h4y"
                          >
                            {statusText}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]"
                          data-oid="cochuaw"
                        >
                          <span data-oid="o63woh9">
                            Key:{" "}
                            <span
                              className="font-mono text-foreground/70"
                              data-oid="o5llov_"
                            >
                              {(agent.api_key ?? "N/A").slice(0, 6)}...
                            </span>
                          </span>
                          <span className="hidden sm:inline" data-oid="2lboj_.">
                            •
                          </span>
                          <span data-oid=":igco.l">
                            Limit: {agent.messages_limit ?? "∞"}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="ui-button ui-button--subtle py-1.5 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        data-oid="1fzb_oj"
                      >
                        Configure
                      </Link>
                    </li>
                  );
                })}
            {totalAgents > 5 && !isLoading && (
              <li
                className="pt-2 text-center text-xs text-[var(--foreground-muted)]"
                data-oid="ca5iq-k"
              >
                Showing recent 5 agents
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div
      className="ui-card p-5 group hover:border-accent/20 transition-colors"
      data-oid="79ip-q5"
    >
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground-muted)] font-semibold"
        data-oid="ynwbhp2"
      >
        {label}
      </p>
      <p
        className="mt-2 text-2xl font-bold text-foreground tracking-tight group-hover:text-accent transition-colors"
        data-oid="8yi9h.p"
      >
        {value}
      </p>
      <p
        className="text-xs text-[var(--foreground-muted)] mt-1 opacity-70"
        data-oid="7fvql7n"
      >
        {helper}
      </p>
    </div>
  );
}

function AgentSkeleton() {
  return (
    <li
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface/30 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-oid="el4gtvf"
    >
      <div className="space-y-2 w-full" data-oid="a3yl0_:">
        <div className="flex items-center gap-3" data-oid="kq:fsjr">
          <span className="h-2 w-2 rounded-full bg-border" data-oid="pe7uge4" />
          <span
            className="h-4 w-32 rounded bg-border/50 animate-pulse"
            data-oid="i79u_hy"
          />
        </div>
        <div
          className="h-3 w-48 rounded bg-border/30 animate-pulse"
          data-oid="wgpqh-t"
        />
      </div>
    </li>
  );
}
