import Link from "next/link";
import AgentsSection from "./AgentsSection";
import { createServer } from "@/lib/supabase/server";

const PLAN_LIMITS: Record<string, string> = {
  free: "1,000",
  basic: "2,000",
  pro: "10,000",
};

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

function formatDate(value: string | null | undefined) {
  if (!value) return "No expiry";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildSuggestedImprovements(messages: MessageRow[]) {
  const suggestions = [
    {
      title: "Add a shipping and returns answer",
      reason: "Several ecommerce chats usually stall on delivery times, refunds, or exchanges.",
      action: "Create FAQ",
    },
    {
      title: "Create a product recommendation rule",
      reason: "Guide the agent to ask budget, use case, and urgency before recommending items.",
      action: "Add rule",
    },
    {
      title: "Define human handoff triggers",
      reason: "Escalate complaints, order changes, and refund intent before the customer repeats themselves.",
      action: "Review",
    },
  ];

  if (!messages.length) return suggestions.slice(0, 2);

  const hasObjections = messages.some((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, OBJECTION_TERMS),
  );
  const hasHandoff = messages.some((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, HANDOFF_TERMS),
  );

  return suggestions.filter((suggestion) => {
    if (suggestion.action === "Create FAQ") return hasObjections;
    if (suggestion.action === "Review") return hasHandoff;
    return true;
  });
}

export default async function DashboardPage() {
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
  const planLabel = plan.toUpperCase();
  const planLimitLabel = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const activeUntil = formatDate(profile?.active_until);
  const activeAgents = agents.filter((agent) => agent.is_active).length;
  const pausedAgents = agents.length - activeAgents;
  const objectionSignals = recentMessages.filter((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, OBJECTION_TERMS),
  );
  const handoffSignals = recentMessages.filter((row) =>
    containsAny(`${row.message ?? ""} ${row.reply ?? ""}`, HANDOFF_TERMS),
  );
  const suggestions = buildSuggestedImprovements(recentMessages);

  const opportunityCards = [
    {
      label: "Revenue opportunities",
      value: objectionSignals.length,
      helper: "Chats mentioning price, stock, shipping, size, or returns.",
    },
    {
      label: "Training suggestions",
      value: suggestions.length,
      helper: "Prompt, FAQ, or workflow improvements ready to review.",
    },
    {
      label: "Human follow-ups",
      value: handoffSignals.length,
      helper: "Chats that may need support, retention, or escalation.",
    },
    {
      label: "Active agents",
      value: `${activeAgents}/${agents.length}`,
      helper: pausedAgents ? `${pausedAgents} paused` : "All configured agents are active.",
    },
  ];

  const playbooks = [
    {
      title: "Fashion fit assistant",
      detail: "Size guidance, returns confidence, outfit pairings, and stock-aware recommendations.",
    },
    {
      title: "Beauty routine advisor",
      detail: "Skin concerns, ingredient checks, bundles, and repeat-purchase prompts.",
    },
    {
      title: "Electronics compatibility desk",
      detail: "Model matching, warranty answers, accessory upsells, and setup support.",
    },
  ];

  const simulatorScenarios = [
    "Customer asks if the product fits their use case",
    "Customer objects to shipping cost",
    "Customer wants a refund or human support",
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="ui-card ui-card--strong p-6">
          <p className="ui-badge">Commerce Copilot</p>
          <div className="mt-5 max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Turn store conversations into sales actions.
            </h1>
            <p className="text-sm leading-6 text-[var(--foreground-muted)] sm:text-base">
              Your agents do more than answer chats. They surface objections,
              handoff moments, product gaps, and training ideas your team can
              act on.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/agents" className="ui-button ui-button--primary">
              Configure agents
            </Link>
            <Link
              href="/dashboard/integrations"
              className="ui-button ui-button--secondary"
            >
              Connect catalog
            </Link>
          </div>
        </div>

        <aside className="ui-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
            Plan health
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--foreground-muted)]">Plan</span>
              <span className="font-semibold">{planLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--foreground-muted)]">Limit</span>
              <span className="font-semibold">{planLimitLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--foreground-muted)]">Renewal</span>
              <span className="font-semibold">{activeUntil}</span>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="ui-button ui-button--secondary mt-5 w-full justify-center"
          >
            Manage subscription
          </Link>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {opportunityCards.map((item) => (
          <article key={item.label} className="ui-card p-5">
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

      <section className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8 xl:col-span-9">
          <div className="ui-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Opportunity board
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  What the copilot noticed
                </h2>
              </div>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-[var(--foreground-muted)]">
                Last {recentMessages.length} conversations
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SignalColumn
                title="Sales friction"
                empty="No pricing, stock, return, or delivery objections detected yet."
                items={objectionSignals.slice(0, 3).map((row) => row.message)}
              />
              <SignalColumn
                title="Human handoff"
                empty="No urgent handoff signals detected yet."
                items={handoffSignals.slice(0, 3).map((row) => row.message)}
              />
              <SignalColumn
                title="Training queue"
                empty="Start collecting conversations to generate stronger training ideas."
                items={suggestions.map((item) => item.title)}
              />
            </div>
          </div>

          <AgentsSection planLimitLabel={planLimitLabel} />
        </div>

        <aside className="space-y-6 lg:col-span-4 xl:col-span-3">
          <div className="ui-card p-6">
            <h3 className="font-semibold text-foreground">Launch playbooks</h3>
            <div className="mt-4 space-y-3">
              {playbooks.map((playbook) => (
                <article
                  key={playbook.title}
                  className="rounded-xl border border-border bg-surface/40 p-3"
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

          <div className="ui-card p-6">
            <h3 className="font-semibold text-foreground">Agent simulator</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              Test common ecommerce moments before publishing a widget.
            </p>
            <div className="mt-4 space-y-2">
              {simulatorScenarios.map((scenario) => (
                <div
                  key={scenario}
                  className="rounded-xl border border-border bg-surface/40 px-3 py-2 text-xs text-foreground"
                >
                  {scenario}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/agents"
              className="ui-button ui-button--secondary mt-5 w-full justify-center"
            >
              Open an agent
            </Link>
          </div>
        </aside>
      </section>
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
