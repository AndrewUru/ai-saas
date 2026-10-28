import type { User } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";
import { normalizePlanId } from "@/lib/plans";
import { createAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// No custom title: metadata is sent before the auth check runs.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 1000;
const ROW_CAP = 20000;
const RECENT_LIMIT = 25;
const TABLE_LIMIT = 100;
const FILTER_ID_LIMIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

type AdminClient = ReturnType<typeof createAdmin>;

type ProfileRow = {
  id: string;
  plan: string | null;
  active_until: string | null;
};

type AgentRow = {
  id: string;
  user_id: string;
  name: string | null;
  is_active: boolean | null;
  messages_limit: number | null;
  created_at: string | null;
};

type MessageStatRow = {
  agent_id: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  agent_id: string;
  channel: string | null;
  message: string | null;
  reply: string | null;
  created_at: string | null;
};

type SubscriptionRow = {
  id: string;
  user_id: string | null;
  plan: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  paypal_order_id?: string | null;
  paypal_subscription_id?: string | null;
  created_at?: string | null;
  started_at?: string | null;
};

type WooRow = {
  id: string;
  user_id: string;
  label: string | null;
  store_url: string | null;
  is_active: boolean | null;
  products_indexed_count: number | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
};

type ShopifyRow = Omit<WooRow, "store_url"> & { shop_domain: string | null };

type StoreRow = {
  id: string;
  user_id: string;
  kind: "WooCommerce" | "Shopify";
  label: string | null;
  url: string | null;
  is_active: boolean | null;
  products_indexed_count: number | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
};

type PageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type Tone = "good" | "warn" | "bad" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  bad: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  neutral: "border-border bg-surface-strong/50 text-[var(--foreground-muted)]",
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const numberFormatter = new Intl.NumberFormat("es-ES");

// PostgREST caps each response at 1000 rows, so page through until the cap.
async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
) {
  const rows: T[] = [];
  for (let from = 0; from < ROW_CAP; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) return { rows, truncated: false, error: error.message };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) {
      return { rows, truncated: false, error: null };
    }
  }
  return { rows, truncated: true, error: null };
}

async function fetchAllUsers(admin: AdminClient) {
  const users: User[] = [];
  for (let page = 1; users.length < ROW_CAP; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) return { users, error: error.message };
    users.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
  }
  return { users, error: null };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function formatCount(value: number | null | undefined, truncated = false) {
  if (value === null || value === undefined) return "—";
  return `${numberFormatter.format(value)}${truncated ? "+" : ""}`;
}

function subscriptionTone(status: string | null): Tone {
  const normalized = (status ?? "").toLowerCase();
  if (["active", "completed", "approved"].includes(normalized)) return "good";
  if (["pending", "approval_pending", "created"].includes(normalized)) return "warn";
  if (!normalized) return "neutral";
  return "bad";
}

function countBy<T>(rows: T[], key: (row: T) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const id = key(row);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export default async function SuperAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireSuperAdmin();

  const { q } = await searchParams;
  const rawQuery = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const query = rawQuery.toLowerCase();

  const admin = createAdmin();
  const now = Date.now();
  const since7d = now - 7 * DAY_MS;
  const since30dIso = new Date(now - 30 * DAY_MS).toISOString();
  const since7dIso = new Date(since7d).toISOString();

  const [
    usersResult,
    profilesResult,
    agentsResult,
    messageStatsResult,
    wooResult,
    shopifyResult,
    totalMessagesResult,
    loads7dResult,
    opens7dResult,
  ] = await Promise.all([
    fetchAllUsers(admin),
    fetchAllRows<ProfileRow>((from, to) =>
      admin
        .from("profiles")
        .select("id, plan, active_until")
        .order("id")
        .range(from, to),
    ),
    fetchAllRows<AgentRow>((from, to) =>
      admin
        .from("agents")
        .select("id, user_id, name, is_active, messages_limit, created_at")
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
    fetchAllRows<MessageStatRow>((from, to) =>
      admin
        .from("agent_messages")
        .select("agent_id, created_at")
        .gte("created_at", since30dIso)
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
    fetchAllRows<WooRow>((from, to) =>
      admin
        .from("integrations_woocommerce")
        .select(
          "id, user_id, label, store_url, is_active, products_indexed_count, last_sync_at, last_sync_status",
        )
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
    fetchAllRows<ShopifyRow>((from, to) =>
      admin
        .from("integrations_shopify")
        .select(
          "id, user_id, label, shop_domain, is_active, products_indexed_count, last_sync_at, last_sync_status",
        )
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
    admin.from("agent_messages").select("id", { count: "exact", head: true }),
    admin
      .from("widget_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "load")
      .gte("created_at", since7dIso),
    admin
      .from("widget_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "open")
      .gte("created_at", since7dIso),
  ]);

  const users = [...usersResult.users].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );
  const profiles = profilesResult.rows;
  const agents = agentsResult.rows;
  const messageStats = messageStatsResult.rows;
  const stores: StoreRow[] = [
    ...wooResult.rows.map(({ store_url, ...row }) => ({
      ...row,
      kind: "WooCommerce" as const,
      url: store_url,
    })),
    ...shopifyResult.rows.map(({ shop_domain, ...row }) => ({
      ...row,
      kind: "Shopify" as const,
      url: shop_domain,
    })),
  ];

  const usersById = new Map(users.map((user) => [user.id, user]));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const agentsByUser = countBy(agents, (agent) => agent.user_id);
  const storesByUser = countBy(stores, (store) => store.user_id);
  const messages30dByAgent = countBy(messageStats, (row) => row.agent_id);
  const messages30dByUser = countBy(
    messageStats.filter((row) => agentsById.has(row.agent_id)),
    (row) => agentsById.get(row.agent_id)!.user_id,
  );

  const ownerEmail = (userId: string | null | undefined) =>
    (userId && usersById.get(userId)?.email) || userId || "—";
  const isPro = (userId: string) =>
    normalizePlanId(profilesById.get(userId)?.plan) === "pro";

  const matches = (...values: Array<string | null | undefined>) =>
    !query || values.some((value) => value?.toLowerCase().includes(query));

  const visibleUsers = users.filter((user) => matches(user.email, user.id));
  const visibleAgents = agents.filter((agent) =>
    matches(agent.name, agent.id, ownerEmail(agent.user_id)),
  );
  const visibleStores = stores.filter((store) =>
    matches(store.label, store.url, ownerEmail(store.user_id)),
  );

  // With a search active, load the latest activity of the matched records
  // instead of filtering the global "latest 25".
  let messagesQuery = admin
    .from("agent_messages")
    .select("id, agent_id, channel, message, reply, created_at")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);
  let subscriptionsQuery = admin
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);

  if (query) {
    messagesQuery = messagesQuery.in(
      "agent_id",
      visibleAgents.slice(0, FILTER_ID_LIMIT).map((agent) => agent.id),
    );
    subscriptionsQuery = subscriptionsQuery.in(
      "user_id",
      visibleUsers.slice(0, FILTER_ID_LIMIT).map((user) => user.id),
    );
  }

  const [recentMessagesResult, subscriptionsResult] = await Promise.all([
    messagesQuery,
    subscriptionsQuery,
  ]);
  const recentMessages = (recentMessagesResult.data ?? []) as MessageRow[];
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];

  const errors = [
    usersResult.error && `Usuarios: ${usersResult.error}`,
    profilesResult.error && `Perfiles: ${profilesResult.error}`,
    agentsResult.error && `Agentes: ${agentsResult.error}`,
    messageStatsResult.error && `Mensajes (30 días): ${messageStatsResult.error}`,
    wooResult.error && `WooCommerce: ${wooResult.error}`,
    shopifyResult.error && `Shopify: ${shopifyResult.error}`,
    totalMessagesResult.error && `Mensajes (total): ${totalMessagesResult.error.message}`,
    loads7dResult.error && `Eventos del widget: ${loads7dResult.error.message}`,
    opens7dResult.error && `Eventos del widget: ${opens7dResult.error.message}`,
    recentMessagesResult.error && `Conversaciones: ${recentMessagesResult.error.message}`,
    subscriptionsResult.error && `Suscripciones: ${subscriptionsResult.error.message}`,
  ].filter(Boolean) as string[];

  const newUsers7d = users.filter((user) => Date.parse(user.created_at) >= since7d).length;
  const proUsers = users.filter((user) => isPro(user.id)).length;
  const activeAgents = agents.filter((agent) => agent.is_active).length;
  const messages7d = messageStats.filter((row) => Date.parse(row.created_at) >= since7d).length;

  const stats = [
    {
      label: "Usuarios",
      value: formatCount(users.length),
      helper: `+${formatCount(newUsers7d)} en los últimos 7 días`,
    },
    {
      label: "Usuarios Pro",
      value: formatCount(proUsers),
      helper: `${formatCount(users.length - proUsers)} en plan Free`,
    },
    {
      label: "Agentes activos",
      value: `${formatCount(activeAgents)}/${formatCount(agents.length)}`,
      helper: `${formatCount(agents.length - activeAgents)} pausados`,
    },
    {
      label: "Mensajes (30 días)",
      value: formatCount(messageStats.length, messageStatsResult.truncated),
      helper: `${formatCount(messages7d)} en 7 días · ${formatCount(totalMessagesResult.count)} en total`,
    },
    {
      label: "Cargas del widget (7 días)",
      value: formatCount(loads7dResult.count),
      helper: `${formatCount(opens7dResult.count)} aperturas del chat`,
    },
    {
      label: "Tiendas conectadas",
      value: formatCount(stores.length),
      helper: `${formatCount(wooResult.rows.length)} WooCommerce · ${formatCount(shopifyResult.rows.length)} Shopify`,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Super admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Panel de la plataforma
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Datos de todas las cuentas, leídos directamente de Supabase. Horas en UTC.
          </p>
        </div>

        <form method="get" className="flex w-full flex-wrap gap-2 sm:w-auto">
          <label htmlFor="admin-search" className="sr-only">
            Buscar
          </label>
          <input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={rawQuery}
            placeholder="Email, agente o tienda"
            className="ui-input min-w-0 flex-1 py-2 text-sm sm:w-72"
          />
          <button type="submit" className="ui-button ui-button--secondary text-sm">
            Buscar
          </button>
          {query ? (
            <Link href="/dashboard/admin" className="ui-button ui-button--subtle text-sm">
              Limpiar
            </Link>
          ) : null}
        </form>
      </header>

      {errors.length ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          <p className="font-semibold">Algunas consultas fallaron:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-border bg-surface/35 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">{stat.helper}</p>
          </article>
        ))}
      </section>

      {query ? (
        <p className="text-sm text-[var(--foreground-muted)]">
          Resultados para <span className="font-semibold text-foreground">“{rawQuery}”</span>. Las
          métricas de arriba son siempre globales.
        </p>
      ) : null}

      <Section title="Usuarios" total={visibleUsers.length}>
        <DataTable
          headers={["Email", "Plan", "Activo hasta", "Alta", "Último acceso", "Agentes", "Msgs 30d", "Tiendas"]}
          empty="No hay usuarios que coincidan."
          rows={visibleUsers.slice(0, TABLE_LIMIT).map((user) => {
            const profile = profilesById.get(user.id);
            const pro = isPro(user.id);
            return {
              key: user.id,
              cells: [
                <IdentityCell key="email" primary={user.email ?? "—"} secondary={user.id} />,
                <Badge key="plan" tone={pro ? "good" : "neutral"}>{pro ? "Pro" : "Free"}</Badge>,
                formatDate(profile?.active_until),
                formatDate(user.created_at),
                formatDate(user.last_sign_in_at),
                formatCount(agentsByUser.get(user.id) ?? 0),
                formatCount(messages30dByUser.get(user.id) ?? 0),
                formatCount(storesByUser.get(user.id) ?? 0),
              ],
            };
          })}
        />
      </Section>

      <Section title="Agentes" total={visibleAgents.length}>
        <DataTable
          headers={["Agente", "Dueño", "Estado", "Cupo restante", "Msgs 30d", "Creado"]}
          empty="No hay agentes que coincidan."
          rows={visibleAgents.slice(0, TABLE_LIMIT).map((agent) => ({
            key: agent.id,
            cells: [
              <IdentityCell key="name" primary={agent.name || "Sin nombre"} secondary={agent.id} />,
              ownerEmail(agent.user_id),
              <Badge key="status" tone={agent.is_active ? "good" : "neutral"}>
                {agent.is_active ? "Activo" : "Pausado"}
              </Badge>,
              agent.messages_limit === null ? "Ilimitado" : formatCount(agent.messages_limit),
              formatCount(messages30dByAgent.get(agent.id) ?? 0),
              formatDate(agent.created_at),
            ],
          }))}
        />
      </Section>

      <Section
        title="Conversaciones recientes"
        total={recentMessages.length}
        note={`Los últimos ${RECENT_LIMIT} mensajes${query ? " de los agentes encontrados" : " de toda la plataforma"}.`}
      >
        {recentMessages.length ? (
          <ul className="space-y-3">
            {recentMessages.map((row) => {
              const agent = agentsById.get(row.agent_id);
              return (
                <li key={row.id} className="rounded-xl border border-border bg-surface/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--foreground-muted)]">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold text-foreground">
                        {agent?.name || "Agente eliminado"}
                      </span>
                      {" · "}
                      {ownerEmail(agent?.user_id)}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone="neutral">{row.channel ?? "widget"}</Badge>
                      {formatDate(row.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-foreground">
                    {row.message || "—"}
                  </p>
                  {row.reply ? (
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words rounded-lg bg-background/60 p-3 text-xs leading-5 text-[var(--foreground-muted)]">
                      {row.reply}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyBox>No hay conversaciones{query ? " para esta búsqueda" : ""}.</EmptyBox>
        )}
      </Section>

      <Section
        title="Pagos y suscripciones"
        total={subscriptions.length}
        note={`Los últimos ${RECENT_LIMIT} registros${query ? " de los usuarios encontrados" : ""}.`}
      >
        <DataTable
          headers={["Fecha", "Usuario", "Plan", "Estado", "Importe", "Referencia PayPal"]}
          empty="No hay pagos registrados."
          rows={subscriptions.map((sub) => ({
            key: sub.id,
            cells: [
              formatDate(sub.created_at ?? sub.started_at),
              ownerEmail(sub.user_id),
              (sub.plan ?? "—").toUpperCase(),
              <Badge key="status" tone={subscriptionTone(sub.status)}>
                {sub.status ?? "—"}
              </Badge>,
              sub.amount !== null && sub.amount !== undefined
                ? `${sub.amount} ${sub.currency ?? ""}`.trim()
                : "—",
              <span key="ref" className="font-mono text-xs text-[var(--foreground-muted)]">
                {sub.paypal_subscription_id ?? sub.paypal_order_id ?? "—"}
              </span>,
            ],
          }))}
        />
      </Section>

      <Section title="Tiendas conectadas" total={visibleStores.length}>
        <DataTable
          headers={["Tienda", "Tipo", "Dueño", "Estado", "Productos", "Última sync"]}
          empty="No hay tiendas conectadas."
          rows={visibleStores.slice(0, TABLE_LIMIT).map((store) => ({
            key: `${store.kind}-${store.id}`,
            cells: [
              <IdentityCell
                key="store"
                primary={store.label || store.url || "Sin nombre"}
                secondary={store.label ? store.url : null}
              />,
              store.kind,
              ownerEmail(store.user_id),
              <Badge key="status" tone={store.is_active ? "good" : "neutral"}>
                {store.is_active ? "Activa" : "Pausada"}
              </Badge>,
              formatCount(store.products_indexed_count ?? 0),
              <span key="sync">
                {formatDate(store.last_sync_at)}
                {store.last_sync_status ? (
                  <span className="block text-xs text-[var(--foreground-muted)]">
                    {store.last_sync_status}
                  </span>
                ) : null}
              </span>,
            ],
          }))}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  total,
  note,
  children,
}: {
  title: string;
  total: number;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ui-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-[var(--foreground-muted)]">
          {total > TABLE_LIMIT
            ? `Mostrando ${TABLE_LIMIT} de ${formatCount(total)} · usa la búsqueda para filtrar`
            : `${formatCount(total)} en total`}
        </span>
      </div>
      {note ? (
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">{note}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: { key: string; cells: React.ReactNode[] }[];
  empty: string;
}) {
  if (!rows.length) return <EmptyBox>{empty}</EmptyBox>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-surface-strong/40 text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.key} className="align-top transition hover:bg-surface-strong/30">
              {row.cells.map((cell, index) => (
                <td key={index} className="px-3 py-2.5 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IdentityCell({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string | null;
}) {
  return (
    <span className="block max-w-[280px]">
      <span className="block truncate font-medium text-foreground">{primary}</span>
      {secondary ? (
        <span className="block truncate font-mono text-[11px] text-[var(--foreground-muted)]">
          {secondary}
        </span>
      ) : null}
    </span>
  );
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-[var(--foreground-muted)]">
      {children}
    </div>
  );
}
