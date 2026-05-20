import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  MessageSquare,
  MousePointerClick,
  Send,
  Type,
} from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";

type MessageRow = {
  id?: string;
  message: string | null;
  reply: string | null;
  created_at: string | null;
};

type WidgetEventRow = {
  event_type: string;
  page_url: string | null;
  word_count: number | null;
  created_at: string | null;
};

function countWords(value: string | null | undefined) {
  return (value ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDomain(value: string | null) {
  if (!value) return "Unknown page";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value.slice(0, 80);
  }
}

function groupByDay(
  events: WidgetEventRow[],
  messages: MessageRow[],
  startDate: Date,
) {
  const days = new Map<string, { label: string; events: number; messages: number }>();

  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - index);
    const key = day.toISOString().slice(0, 10);
    days.set(key, {
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day),
      events: 0,
      messages: 0,
    });
  }

  for (const event of events) {
    if (!event.created_at) continue;
    const date = new Date(event.created_at);
    if (date < startDate) continue;
    const key = date.toISOString().slice(0, 10);
    const bucket = days.get(key);
    if (bucket) bucket.events += 1;
  }

  for (const message of messages) {
    if (!message.created_at) continue;
    const date = new Date(message.created_at);
    if (date < startDate) continue;
    const key = date.toISOString().slice(0, 10);
    const bucket = days.get(key);
    if (bucket) bucket.messages += 1;
  }

  return Array.from(days.values());
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof BarChart3;
}) {
  return (
    <article className="ui-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--foreground-muted)]">
        {helper}
      </p>
    </article>
  );
}

export default async function AgentAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !agent) return notFound();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const startIso = startDate.toISOString();

  const [{ data: messagesData }, { data: eventsData }] = await Promise.all([
    supabase
      .from("agent_messages")
      .select("message, reply, created_at")
      .eq("agent_id", agent.id)
      .gte("created_at", startIso)
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<MessageRow[]>(),
    supabase
      .from("widget_events")
      .select("event_type, page_url, word_count, created_at")
      .eq("agent_id", agent.id)
      .gte("created_at", startIso)
      .order("created_at", { ascending: false })
      .limit(1000)
      .returns<WidgetEventRow[]>(),
  ]);

  const messages = messagesData ?? [];
  const events = eventsData ?? [];
  const loads = events.filter((event) => event.event_type === "load").length;
  const opens = events.filter((event) => event.event_type === "open").length;
  const sentEvents = events.filter(
    (event) => event.event_type === "message_sent",
  );
  const failedEvents = events.filter(
    (event) => event.event_type === "message_failed",
  ).length;
  const userWordsFromMessages = messages.reduce(
    (total, row) => total + countWords(row.message),
    0,
  );
  const assistantWords = messages.reduce(
    (total, row) => total + countWords(row.reply),
    0,
  );
  const userWordsFromEvents = sentEvents.reduce(
    (total, event) => total + (event.word_count ?? 0),
    0,
  );
  const userWords = Math.max(userWordsFromMessages, userWordsFromEvents);
  const totalWords = userWords + assistantWords;
  const openRate = loads > 0 ? Math.round((opens / loads) * 100) : 0;
  const messageRate = opens > 0 ? Math.round((messages.length / opens) * 100) : 0;
  const avgUserWords =
    messages.length > 0 ? Math.round(userWords / messages.length) : 0;
  const activity = groupByDay(events, messages, startDate);
  const maxActivity = Math.max(
    1,
    ...activity.map((day) => day.events + day.messages),
  );
  const topPages = Array.from(
    events.reduce((acc, event) => {
      const key = getDomain(event.page_url);
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="ui-card--strong p-6">
        <p className="ui-badge">Analytics</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {agent.name} widget analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Traffic, opens, interactions, words written, and recent widget
              conversations from the last 30 days.
            </p>
          </div>
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="ui-button ui-button--ghost"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to setup
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Activity}
          label="Traffic"
          value={formatNumber(loads)}
          helper="Widget script loads recorded on storefront pages."
        />
        <MetricCard
          icon={MousePointerClick}
          label="Opens"
          value={formatNumber(opens)}
          helper={`${openRate}% open rate from recorded loads.`}
        />
        <MetricCard
          icon={MessageSquare}
          label="Interactions"
          value={formatNumber(messages.length)}
          helper={`${messageRate}% of opens became conversations.`}
        />
        <MetricCard
          icon={Type}
          label="Words"
          value={formatNumber(totalWords)}
          helper={`${formatNumber(userWords)} user words, ${formatNumber(
            assistantWords,
          )} assistant words.`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="ui-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Activity
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                Last 7 days
              </h2>
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-[var(--foreground-muted)]">
              {formatNumber(failedEvents)} failed messages
            </span>
          </div>

          <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3">
            {activity.map((day) => {
              const total = day.events + day.messages;
              const height = Math.max(8, Math.round((total / maxActivity) * 100));
              return (
                <div key={day.label} className="flex h-full flex-col justify-end gap-2">
                  <div className="flex flex-1 items-end rounded-xl border border-border bg-surface/35 p-1">
                    <div
                      className="w-full rounded-lg bg-accent/70"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">
                      {total}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--foreground-muted)]">
                      {day.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="ui-card p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-[var(--foreground-muted)]">
                <Send className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Message depth</h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Average user message length
                </p>
              </div>
            </div>
            <p className="mt-5 text-3xl font-semibold">{avgUserWords}</p>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              words per interaction
            </p>
          </div>

          <div className="ui-card p-5">
            <h3 className="font-semibold text-foreground">Top pages</h3>
            <div className="mt-4 space-y-2">
              {topPages.length ? (
                topPages.map(([page, count]) => (
                  <div
                    key={page}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/35 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate text-[var(--foreground-muted)]">
                      {page}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatNumber(count)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                  No widget traffic recorded yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="ui-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Conversations
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Recent interactions
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-[var(--foreground-muted)]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Last 30 days
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {messages.length ? (
            messages.slice(0, 12).map((message, index) => (
              <article
                key={`${message.created_at}-${index}`}
                className="rounded-2xl border border-border bg-surface/35 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {formatDate(message.created_at)}
                  </p>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-[var(--foreground-muted)]">
                    {countWords(message.message)} user words
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground">
                  {message.message || "Empty user message"}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--foreground-muted)]">
                  {message.reply || "No assistant reply stored."}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/20 p-8 text-center">
              <BarChart3 className="mx-auto h-6 w-6 text-[var(--foreground-muted)]" />
              <p className="mt-3 font-semibold text-foreground">
                No interactions yet
              </p>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Once customers write through the widget, conversations and word
                metrics will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
