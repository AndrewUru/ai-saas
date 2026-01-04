"use client";

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
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => setOpen(true)}
            className="ui-button ui-button--secondary px-3 py-2"
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">AI Commerce Agents</span>
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase font-semibold text-[var(--foreground-muted)]">
              Dashboard
            </span>
          </div>

          <div className="h-8 w-8 rounded-full bg-surface-strong border border-border flex items-center justify-center text-xs font-bold">
            A
          </div>
        </div>
      </header>

      {/* Desktop layout */}
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen border-r border-border bg-surface/40">
          <div className="flex w-full flex-col p-4">
            <div className="flex items-center justify-between gap-3 px-2 py-3">
              <div>
                <div className="text-sm font-semibold">AI Commerce Agents</div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  Multi-tenant control panel
                </div>
              </div>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase font-semibold text-[var(--foreground-muted)]">
                Pro
              </span>
            </div>

            <nav className="mt-4 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                    active(item.href)
                      ? "bg-accent/10 border border-accent/20 text-foreground"
                      : "hover:bg-surface-strong/50 text-[var(--foreground-muted)]"
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {active(item.href) && (
                    <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                  )}
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
                  className="mt-2 inline-flex w-full justify-center ui-button ui-button--secondary"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0">
          {/* Desktop header */}
          <header className="hidden lg:block sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[14px] uppercase font-semibold text-[var(--foreground-muted)]">
                  Board
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/docs"
                  className="text-sm font-medium text-[var(--foreground-muted)] hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
                <div className="h-8 w-8 rounded-full bg-surface-strong border border-border flex items-center justify-center text-xs font-bold">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] border-r border-border bg-background p-4">
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
                ✕
              </button>
            </div>

            <nav className="mt-4 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                    active(item.href)
                      ? "bg-accent/10 border border-accent/20 text-foreground"
                      : "hover:bg-surface-strong/50 text-[var(--foreground-muted)]"
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {active(item.href) && (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
