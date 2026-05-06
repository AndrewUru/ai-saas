"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { label: "Board", href: "/dashboard" },
  { label: "Agents", href: "/dashboard/agents" },
  { label: "Integrations", href: "/dashboard/integrations" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Docs", href: "/dashboard/docs" },
];

function cx(...cls: Array<string | false | undefined | null>) {
  return cls.filter(Boolean).join(" ");
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = useMemo(() => {
    return (href: string) =>
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname?.startsWith(href);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => setOpen(true)}
            className="ui-button ui-button--secondary px-3 py-2"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="dashboard-mobile-menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">AI Commerce Agents</span>
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
              Dashboard
            </span>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-strong text-xs font-bold">
            A
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border bg-surface/40 lg:sticky lg:top-0 lg:flex lg:h-screen">
          <div className="flex w-full flex-col p-4">
            <div className="flex items-center justify-between gap-3 px-2 py-3">
              <div>
                <div className="text-sm font-semibold">AI Commerce Agents</div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  Multi-tenant control panel
                </div>
              </div>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
                Pro
              </span>
            </div>

            <nav className="mt-4 space-y-1" aria-label="Dashboard">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                    active(item.href)
                      ? "border border-accent/20 bg-accent/10 text-foreground"
                      : "text-[var(--foreground-muted)] hover:bg-surface-strong/50",
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {active(item.href) ? (
                    <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-4">
              <div className="ui-card p-4">
                <div className="text-xs text-[var(--foreground-muted)]">
                  Need human support?
                </div>
                <Link
                  href="/contact"
                  className="ui-button ui-button--secondary mt-2 inline-flex w-full justify-center"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-label="Close menu backdrop"
            type="button"
          />

          <div
            id="dashboard-mobile-menu"
            className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] border-r border-border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">AI Commerce Agents</div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  Dashboard
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ui-button ui-button--secondary px-3 py-2"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-4 space-y-1" aria-label="Dashboard">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                    active(item.href)
                      ? "border border-accent/20 bg-accent/10 text-foreground"
                      : "text-[var(--foreground-muted)] hover:bg-surface-strong/50",
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {active(item.href) ? (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
