import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Boxes,
  LifeBuoy,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import AgentsSection from "./AgentsSection";
import { format, intlLocales, type Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { getI18n } from "@/lib/i18n/server";
import { getPlanConfig } from "@/lib/plans";
import { createServer } from "@/lib/supabase/server";

const OBJECTION_TERMS = [
  "price",
  "expensive",
  "discount",
  "shipping",
  "return",
  "refund",
  "size",
  "stock",
  "available",
  "delivery",
  "precio",
  "envio",
  "devolucion",
  "talla",
  "stock",
];

const HANDOFF_TERMS = [
  "human",
  "agent",
  "support",
  "complaint",
  "angry",
  "cancel",
  "humano",
  "soporte",
  "reclamo",
  "cancelar",
];

type AgentRow = {
  id: string;
  name: string | null;
  is_active: boolean | null;
  messages_limit: number | null;
};

type MessageRow = {
  agent_id: string;
  message: string | null;
  reply: string | null;
  created_at: string | null;
};

function containsAny(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function formatDate(
  value: string | null | undefined,
  locale: Locale,
  fallback: string,
) {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(intlLocales[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildSuggestedImprovements(
  messages: MessageRow[],
  t: Messages["home"]["suggestions"],
) {
  const suggestions = [
    { kind: "faq", ...t.faq },
    { kind: "rule", ...t.rule },
    { kind: "handoff", ...t.handoff },
  ];

  if (!messages.length) return suggestions.slice(0, 2);

  const hasObjections = messages.some((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, OBJECTION_TERMS),
  );
  const hasHandoff = messages.some((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, HANDOFF_TERMS),
  );

  return suggestions.filter((suggestion) => {
    if (suggestion.kind === "faq") return hasObjections;
    if (suggestion.kind === "handoff") return hasHandoff;
    return true;
  });
}

export default async function DashboardPage() {
  const { locale, t } = await getI18n();
  const h = t.home;
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  type Profile = { plan: string | null; active_until: string | null };

  const [{ data: profile }, { data: agentsData }] = user
    ? await Promise.all([
        supabase
          .from("profiles")
          .select("plan, active_until")
          .eq("id", user.id)
          .single<Profile>(),
        supabase
          .from("agents")
          .select("id, name, is_active, messages_limit")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .returns<AgentRow[]>(),
      ])
    : [{ data: null }, { data: [] }];

  const agents = agentsData ?? [];
  const agentIds = agents.map((agent) => agent.id);

  const { data: recentMessagesData } = agentIds.length
    ? await supabase
        .from("agent_messages")
        .select("agent_id, message, reply, created_at")
        .in("agent_id", agentIds)
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<MessageRow[]>()
    : { data: [] };

  const recentMessages = recentMessagesData ?? [];
  const plan = (profile?.plan ?? "free").toLowerCase();
  const planConfig = getPlanConfig(plan);
  const planLabel = plan.toUpperCase();
  const planLimitLabel = planConfig.messageLimit.toLocaleString(intlLocales[locale]);
  const activeUntil = formatDate(profile?.active_until, locale, t.dashCommon.noExpiry);
  const activeAgents = agents.filter((agent) => agent.is_active).length;
  const pausedAgents = agents.length - activeAgents;
  const objectionSignals = recentMessages.filter((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, OBJECTION_TERMS),
  );
  const handoffSignals = recentMessages.filter((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, HANDOFF_TERMS),
  );
  const suggestions = buildSuggestedImprovements(recentMessages, h.suggestions);

  const opportunityCards = [
    { ...h.cards.revenue, value: objectionSignals.length },
    { ...h.cards.training, value: suggestions.length },
    { ...h.cards.followups, value: handoffSignals.length },
    {
      label: h.cards.active.label,
      value: `${activeAgents}/${agents.length}`,
      helper: pausedAgents
        ? format(h.cards.active.paused, { count: pausedAgents })
        : h.cards.active.allActive,
    },
  ];

  const playbooks = h.playbooks;
  const simulatorScenarios = h.scenarios;
  const recentAgents = agents.slice(0, 4);

  const commandPrompts = [
    {
      ...h.commands.test,
      href: recentAgents[0]?.id
        ? `/dashboard/agents/${recentAgents[0].id}`
        : "/dashboard/agents",
      icon: MessageSquare,
    },
    {
      ...h.commands.connect,
      href: "/dashboard/integrations",
      icon: Boxes,
    },
    {
      ...h.commands.create,
      href: "/dashboard/agents",
      icon: Bot,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-border bg-surface/50 p-4 shadow-soft sm:p-6">
          <div className="mx-auto flex min-h-[360px] max-w-3xl flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {h.copilot}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {format(h.activeOf, { active: activeAgents, total: agents.length })}
                </p>
              </div>
            </div>

            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {h.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] sm:text-base">
              {h.subtitle}
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-background/70 p-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/70 px-4 py-3">
                <MessageSquare
                  className="h-4 w-4 shrink-0 text-[var(--foreground-muted)]"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 text-sm text-[var(--foreground-muted)]">
                  {h.promptPlaceholder}
                </span>
                <Link
                  href={recentAgents[0]?.id ? `/dashboard/agents/${recentAgents[0].id}` : "/dashboard/agents"}
                  className="ui-button ui-button--primary h-10 w-10 shrink-0 p-0"
                  aria-label={h.openWorkspaceAria}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {commandPrompts.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <Link
                      key={prompt.label}
                      href={prompt.href}
                      className="group rounded-xl border border-border bg-surface/40 p-3 transition hover:border-accent/25 hover:bg-surface"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-[var(--foreground-muted)] transition group-hover:text-accent">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {prompt.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--foreground-muted)]">
                            {prompt.detail}
                          </span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="ui-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                {h.plan}
              </p>
              <Link
                href="/dashboard/billing"
                className="text-xs font-semibold text-accent hover:text-accent"
              >
                {h.manage}
              </Link>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <InfoRow label={h.current} value={planLabel} />
              <InfoRow label={h.limit} value={planLimitLabel} />
              <InfoRow label={h.renewal} value={activeUntil} />
            </div>
          </div>

          <div className="ui-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground">{h.recentAgents}</h2>
              <Link
                href="/dashboard/agents"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent"
              >
                {h.all}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {recentAgents.length ? (
                recentAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/30 px-3 py-3 transition hover:border-accent/25 hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {agent.name || t.dashCommon.unnamedAgent}
                      </span>
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {agent.is_active ? t.dashCommon.active : t.dashCommon.paused}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-[var(--foreground-muted)]"
                      aria-hidden="true"
                    />
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-[var(--foreground-muted)]">
                  {h.noAgents}
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {opportunityCards.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-surface/35 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {item.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
              {item.helper}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="ui-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {h.signalsEyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  {h.signalsTitle}
                </h2>
              </div>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-[var(--foreground-muted)]">
                {format(h.lastConversations, { count: recentMessages.length })}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SignalColumn
                title={h.salesFriction}
                empty={h.salesFrictionEmpty}
                items={objectionSignals.slice(0, 3).map((row) => row.message)}
              />
              <SignalColumn
                title={h.handoff}
                empty={h.handoffEmpty}
                items={handoffSignals.slice(0, 3).map((row) => row.message)}
              />
              <SignalColumn
                title={h.trainingQueue}
                empty={h.trainingQueueEmpty}
                items={suggestions.map((item) => item.title)}
              />
            </div>
          </div>

          <AgentsSection planLimitLabel={planLimitLabel} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="ui-card p-5">
            <h3 className="font-semibold text-foreground">{h.launchPlaybooks}</h3>
            <div className="mt-4 space-y-3">
              {playbooks.map((playbook) => (
                <article
                  key={playbook.title}
                  className="rounded-xl border border-border bg-surface/35 p-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {playbook.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                    {playbook.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="ui-card p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-[var(--foreground-muted)]">
                <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-foreground">{h.testScenarios}</h3>
            </div>
            <div className="mt-4 space-y-2">
              {simulatorScenarios.map((scenario) => (
                <div
                  key={scenario}
                  className="rounded-xl border border-border bg-surface/35 px-3 py-2 text-xs text-foreground"
                >
                  {scenario}
                </div>
              ))}
            </div>
            <Link
              href={recentAgents[0]?.id ? `/dashboard/agents/${recentAgents[0].id}` : "/dashboard/agents"}
              className="ui-button ui-button--secondary mt-5 w-full justify-center"
            >
              {t.dashCommon.openWorkspace}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/30 px-3 py-2">
      <span className="text-[var(--foreground-muted)]">{label}</span>
      <span className="min-w-0 truncate text-right font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function SignalColumn({
  title,
  items,
  empty,
}: {
  title: string;
  items: Array<string | null>;
  empty: string;
}) {
  const visibleItems = items.filter(Boolean) as string[];

  return (
    <div className="rounded-xl border border-border bg-surface/30 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {visibleItems.length ? (
        <ul className="mt-3 space-y-2">
          {visibleItems.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="line-clamp-3 rounded-lg bg-background/60 p-3 text-xs leading-5 text-[var(--foreground-muted)]"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-5 text-[var(--foreground-muted)]">
          {empty}
        </p>
      )}
    </div>
  );
}
