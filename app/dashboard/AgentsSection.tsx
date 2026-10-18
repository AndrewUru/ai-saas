"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n/client";
import { format } from "@/lib/i18n/config";
import { useAgents } from "./hooks/useAgents";

type Props = {
  planLimitLabel: string;
};

export default function AgentsSection({ planLimitLabel }: Props) {
  const { data, isLoading, isError } = useAgents();
  const { t } = useI18n();
  const s = t.home.section;
  const c = t.dashCommon;
  const agents = data ?? [];
  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent) => agent.is_active).length;

  return (
    <section>
      <div className="ui-card flex flex-col bg-surface/40 p-5 backdrop-blur-md sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {s.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {s.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-[var(--foreground-muted)]">
              {isLoading ? c.loading : format(s.activeCount, { active: activeAgents, total: totalAgents })}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-[var(--foreground-muted)]">
              {format(s.messages, { limit: planLimitLabel })}
            </span>
            <Link
              href="/dashboard/agents"
              className="ui-button ui-button--ghost text-xs"
            >
              {s.viewAll}
            </Link>
          </div>
        </div>

        {isError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
            {s.loadError}
          </div>
        ) : null}

        {!isError && totalAgents === 0 && !isLoading ? (
          <EmptyState
            title={s.emptyTitle}
            description={s.emptyDescription}
            actionHref="/dashboard/agents"
            actionLabel={s.createAgent}
          />
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
                  const statusText = agent.is_active ? c.active : c.paused;

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
                            {agent.name || c.unnamedAgent}
                          </span>
                          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                            {statusText}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--foreground-muted)]">
                          <span>
                            {s.key}{" "}
                            <span className="font-mono text-foreground/70">
                              {(agent.api_key ?? "N/A").slice(0, 6)}...
                            </span>
                          </span>
                          <span className="hidden sm:inline">/</span>
                          <span>
                            {format(s.limit, { limit: agent.messages_limit ?? c.unlimited })}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="ui-button ui-button--subtle px-3 py-1.5 text-xs sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      >
                        {c.openWorkspace}
                      </Link>
                    </li>
                  );
                })}
            {totalAgents > 5 && !isLoading ? (
              <li className="pt-2 text-center text-xs text-[var(--foreground-muted)]">
                {s.showingRecent}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function AgentSkeleton() {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="ui-skeleton h-4 w-32 rounded" />
        </div>
        <div className="ui-skeleton h-3 w-48 rounded" />
      </div>
    </li>
  );
}
