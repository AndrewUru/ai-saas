import Link from "next/link";
import { requireUser } from "@/lib/auth/requireUser";

type IntegrationBase = {
  id: string;
  label: string | null;
  is_active: boolean | null;
  last_sync_at: string | null;
  products_indexed_count: number | null;
};

type WooIntegration = IntegrationBase & {
  store_url: string | null;
};

type ShopifyIntegration = IntegrationBase & {
  shop_domain: string | null;
};

type IntegrationPanelProps<T extends IntegrationBase> = {
  title: string;
  description: string;
  href: string;
  items: T[];
  getLabel: (item: T) => string;
  getSubtitle: (item: T) => string;
};

function formatSyncDate(value: string | null) {
  if (!value) return "Not synced yet";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getLatestSync<T extends { last_sync_at: string | null }>(items: T[]) {
  let latest: string | null = null;

  for (const item of items) {
    if (!item.last_sync_at) continue;
    if (!latest || new Date(item.last_sync_at) > new Date(latest)) {
      latest = item.last_sync_at;
    }
  }

  return latest;
}

function sumIndexed<T extends { products_indexed_count: number | null }>(
  items: T[],
) {
  return items.reduce(
    (total, item) => total + (item.products_indexed_count ?? 0),
    0,
  );
}

function countActive<T extends { is_active: boolean | null }>(items: T[]) {
  return items.filter((item) => item.is_active).length;
}

function formatLabel(label: string | null, fallback: string | null) {
  const trimmed = label?.trim();
  if (trimmed) return trimmed;
  if (fallback) return fallback;
  return "Unnamed integration";
}

function IntegrationPanel<T extends IntegrationBase>({
  title,
  description,
  href,
  items,
  getLabel,
  getSubtitle,
}: IntegrationPanelProps<T>) {
  const total = items.length;
  const activeCount = countActive(items);
  const indexedCount = sumIndexed(items);
  const lastSyncAt = getLatestSync(items);
  const recentItems = items.slice(0, 3);
  const actionLabel = total === 0 ? "Connect" : "Manage";

  return (
    <article className="ui-card flex h-full flex-col p-6" data-oid=".2al.dc">
      <div
        className="flex flex-wrap items-start justify-between gap-4"
        data-oid="24dug4d"
      >
        <div className="space-y-2" data-oid="t8tx-z_">
          <p
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)]"
            data-oid="erh:xpv"
          >
            Provider
          </p>
          <h2
            className="text-xl font-semibold text-foreground"
            data-oid="ibrw9.1"
          >
            {title}
          </h2>
          <p
            className="text-sm text-[var(--foreground-muted)]"
            data-oid="t6mq-5y"
          >
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3" data-oid="a4ff_wo">
          <span
            className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]"
            data-oid="prfqpzj"
          >
            {activeCount}/{total} active
          </span>
          <Link
            href={href}
            className="ui-button ui-button--primary text-xs"
            data-oid="_1dymbb"
          >
            {actionLabel}
          </Link>
        </div>
      </div>

      <div
        className="mt-6 grid gap-3 text-sm text-[var(--foreground-muted)]"
        data-oid="ob5daiy"
      >
        <div className="flex items-center justify-between" data-oid="u0.1nhs">
          <span data-oid="3r1:egl">Connections</span>
          <span className="font-medium text-foreground" data-oid="3:a9a1q">
            {total}
          </span>
        </div>
        <div className="flex items-center justify-between" data-oid="ufx8.hp">
          <span data-oid="h7d41w6">Indexed products</span>
          <span className="font-medium text-foreground" data-oid="7ex8rfg">
            {indexedCount.toLocaleString("en-US")}
          </span>
        </div>
        <div className="flex items-center justify-between" data-oid=":o_dmv:">
          <span data-oid="vr50w71">Last sync</span>
          <span className="font-medium text-foreground" data-oid="w8:c46z">
            {formatSyncDate(lastSyncAt)}
          </span>
        </div>
      </div>

      {total === 0 ? (
        <div
          className="mt-6 rounded-xl border border-dashed border-border/60 bg-surface/30 p-6 text-center text-sm text-[var(--foreground-muted)]"
          data-oid="pyivl2c"
        >
          No connections yet. Add your first store to start syncing data.
        </div>
      ) : (
        <div className="mt-6 space-y-3" data-oid="49u04ec">
          <p
            className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]"
            data-oid="r-3qczk"
          >
            Recent connections
          </p>
          <ul className="space-y-3" data-oid="4xpyv34">
            {recentItems.map((item) => {
              const isActive = item.is_active === true;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface/30 px-4 py-3"
                  data-oid="1pepreg"
                >
                  <div className="space-y-1" data-oid="s3__mha">
                    <p
                      className="text-sm font-medium text-foreground"
                      data-oid="6rt39f:"
                    >
                      {getLabel(item)}
                    </p>
                    <p
                      className="text-xs text-[var(--foreground-muted)]"
                      data-oid="rp0afgx"
                    >
                      {getSubtitle(item)}
                    </p>
                  </div>
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
                      isActive
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-border bg-surface text-[var(--foreground-muted)]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    data-oid="0uaah33"
                  >
                    {isActive ? "Active" : "Paused"}
                  </span>
                </li>
              );
            })}
          </ul>
          {total > 3 && (
            <p
              className="text-xs text-[var(--foreground-muted)]"
              data-oid="y:d.xi9"
            >
              Showing the latest 3 connections.
            </p>
          )}
        </div>
      )}
    </article>
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
    <div className="ui-card p-5" data-oid="og:kj6s">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground-muted)] font-semibold"
        data-oid="-bh01c0"
      >
        {label}
      </p>
      <p
        className="mt-2 text-2xl font-bold text-foreground tracking-tight"
        data-oid="tk1p8gr"
      >
        {value}
      </p>
      <p
        className="text-xs text-[var(--foreground-muted)] mt-1 opacity-70"
        data-oid="-0203.a"
      >
        {helper}
      </p>
    </div>
  );
}

export default async function IntegrationsPage() {
  const { supabase, user } = await requireUser();

  const [wooResult, shopifyResult] = await Promise.all([
    supabase
      .from("integrations_woocommerce")
      .select(
        "id, label, store_url, is_active, last_sync_at, products_indexed_count",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("integrations_shopify")
      .select(
        "id, label, shop_domain, is_active, last_sync_at, products_indexed_count",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const wooIntegrations = (wooResult.data ?? []) as WooIntegration[];
  const shopifyIntegrations = (shopifyResult.data ??
    []) as ShopifyIntegration[];
  const hasError = Boolean(wooResult.error || shopifyResult.error);

  const totalConnections = wooIntegrations.length + shopifyIntegrations.length;
  const activeConnections =
    countActive(wooIntegrations) + countActive(shopifyIntegrations);
  const totalIndexed =
    sumIndexed(wooIntegrations) + sumIndexed(shopifyIntegrations);

  return (
    <>
      <div
        className="mb-8 flex flex-wrap items-center justify-between gap-6"
        data-oid="irgp9bg"
      >
        <div className="max-w-2xl space-y-2" data-oid="29cmwqf">
          <p
            className="text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)]"
            data-oid="ljn2_s_"
          >
            Integrations
          </p>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground"
            data-oid="hp3qp90"
          >
            Connect your stores
          </h1>
          <p
            className="text-sm text-[var(--foreground-muted)]"
            data-oid="znkwuc2"
          >
            Manage WooCommerce and Shopify connections used by your agents.
          </p>
        </div>
        <Link
          href="/docs"
          className="ui-button ui-button--ghost"
          data-oid="p54o2z1"
        >
          View documentation
        </Link>
      </div>

      {hasError && (
        <div
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200"
          data-oid="9ry3fa:"
        >
          We could not load integrations. Please refresh the page.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3" data-oid="mnqujaz">
        <StatCard
          label="Total connections"
          value={totalConnections}
          helper="WooCommerce + Shopify"
          data-oid="07nrk9x"
        />

        <StatCard
          label="Active connections"
          value={activeConnections}
          helper={
            activeConnections === totalConnections
              ? "All stores are active"
              : "Some stores are paused"
          }
          data-oid="f:--woc"
        />

        <StatCard
          label="Products indexed"
          value={totalIndexed.toLocaleString("en-US")}
          helper="Across all stores"
          data-oid="hs5nhnm"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2" data-oid="p_4_wja">
        <IntegrationPanel
          title="WooCommerce"
          description="Sync inventory, orders, and customers from Woo stores."
          href="/integrations/woo"
          items={wooIntegrations}
          getLabel={(item) => formatLabel(item.label, item.store_url)}
          getSubtitle={(item) => item.store_url ?? "Store URL not set"}
          data-oid="x9l281z"
        />

        <IntegrationPanel
          title="Shopify"
          description="Keep Shopify catalogs and order data in sync."
          href="/integrations/shopify"
          items={shopifyIntegrations}
          getLabel={(item) => formatLabel(item.label, item.shop_domain)}
          getSubtitle={(item) => item.shop_domain ?? "Shop domain not set"}
          data-oid=".nn4id2"
        />
      </div>
    </>
  );
}
