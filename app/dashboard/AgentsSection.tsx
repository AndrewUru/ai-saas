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
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Agents created"
          value={isLoading ? "-" : totalAgents}
          helper={
            isLoading
              ? "Loading..."
              : totalAgents === 0
                ? "No agents yet"
                : "Ready to configure"
          }
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
        />

        <StatCard
          label="Message limit"
          value={planLimitLabel}
          helper="Monthly capacity"
        />
      </div>

      <div className="ui-card flex flex-col bg-surface/40 p-6 backdrop-blur-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Your agents
            </h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Manage integrations, limits, and widget setup
            </p>
          </div>
          <Link
            href="/dashboard/agents"
            className="ui-button ui-button--ghost text-xs"
          >
            View all agents
          </Link>
        </div>

        {isError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
            Failed to load agents. Please refresh.
          </div>
        ) : null}

        {!isError && totalAgents === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-medium text-foreground">No agents configured</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--foreground-muted)]">
              Create your first agent to connect store data and start replying
              to chats automatically.
            </p>
            <Link
              href="/dashboard/agents"
              className="ui-button ui-button--primary mt-6"
            >
              Create agent
            </Link>
          </div>
        ) : null}

        {!isError && totalAgents > 0 ? (
          <ul className="space-y-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <AgentSkeleton key={index} />
                ))
              : agents.slice(0, 5).map((agent) => {
                  const statusColor = agent.is_active
                    ? "bg-accent"
                    : "bg-[var(--foreground-muted)]";
                  const statusText = agent.is_active ? "Active" : "Paused";

                  return (
                    <li
                      key={agent.id}
                      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface/30 p-4 transition-all hover:border-accent/20 hover:bg-surface/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${statusColor}`}
                          />

                          <span className="text-sm font-semibold text-foreground">
                            {agent.name || "Unnamed Agent"}
                          </span>
                          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                            {statusText}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--foreground-muted)]">
                          <span>
                            Key:{" "}
                            <span className="font-mono text-foreground/70">
                              {(agent.api_key ?? "N/A").slice(0, 6)}...
                            </span>
                          </span>
                          <span className="hidden sm:inline">/</span>
                          <span>
                            Limit: {agent.messages_limit ?? "Unlimited"}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="ui-button ui-button--subtle px-3 py-1.5 text-xs sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      >
                        Configure
                      </Link>
                    </li>
                  );
                })}
            {totalAgents > 5 && !isLoading ? (
              <li className="pt-2 text-center text-xs text-[var(--foreground-muted)]">
                Showing recent 5 agents
              </li>
            ) : null}
          </ul>
        ) : null}
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
    <div className="ui-card group p-5 transition-colors hover:border-accent/20">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--foreground-muted)] opacity-70">
        {helper}
      </p>
    </div>
  );
}

function AgentSkeleton() {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-4 w-32 animate-pulse rounded bg-border/50" />
        </div>
        <div className="h-3 w-48 animate-pulse rounded bg-border/30" />
      </div>
    </li>
  );
}
