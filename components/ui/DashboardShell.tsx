"use client";

import { Home, LogIn, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { label: "Copilot", href: "/dashboard" },
  { label: "Agents", href: "/dashboard/agents" },
  { label: "Integrations", href: "/dashboard/integrations" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Docs", href: "/dashboard/docs" },
];

const AGENT_SCREENS = [
  { label: "Workspace", suffix: "" },
  { label: "Widget", suffix: "/widget" },
  { label: "Analytics", suffix: "/analytics" },
  { label: "Knowledge", suffix: "/knowledge" },
  { label: "Simulator", suffix: "/simulator" },
  { label: "Install", suffix: "/install" },
] as const;

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!isMounted) return;
        setUserEmail(data.user?.email ?? null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingUser(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setUserEmail(session?.user?.email ?? null);
        setIsLoadingUser(false);
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const active = useMemo(() => {
    return (href: string) =>
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname?.startsWith(href);
  }, [pathname]);

  const agentBaseHref = useMemo(() => {
    const match = pathname?.match(/^\/dashboard\/agents\/([^/]+)/);
    return match ? `/dashboard/agents/${match[1]}` : null;
  }, [pathname]);

  const agentScreenNav = agentBaseHref
    ? AGENT_SCREENS.map((item) => ({
        label: item.label,
        href: `${agentBaseHref}${item.suffix}`,
      }))
    : [];
  const userInitial = userEmail?.charAt(0).toUpperCase() ?? "A";

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

          {isLoadingUser || userEmail ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-strong text-xs font-bold">
              {userInitial}
            </div>
          ) : (
            <Link href="/login" className="ui-button ui-button--secondary px-3 py-1.5 text-xs">
              Log in
            </Link>
          )}
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

            <Link
              href="/"
              className="ui-button ui-button--secondary mt-3 inline-flex w-full justify-center text-xs"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Home page</span>
            </Link>

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

            {agentScreenNav.length ? (
              <nav className="mt-6 space-y-1" aria-label="Agent screens">
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                  Agent screens
                </div>
                {agentScreenNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                      pathname === item.href
                        ? "border border-accent/20 bg-accent/10 text-foreground"
                        : "text-[var(--foreground-muted)] hover:bg-surface-strong/50",
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                    {pathname === item.href ? (
                      <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                    ) : null}
                  </Link>
                ))}
              </nav>
            ) : null}

            <div className="mt-auto space-y-3 pt-4">
              <AccountPanel
                isLoadingUser={isLoadingUser}
                isSigningOut={isSigningOut}
                onSignOut={handleSignOut}
                userEmail={userEmail}
              />
              <Link
                href="/contact"
                className="ui-button ui-button--subtle inline-flex w-full justify-center text-xs"
              >
                Contact support
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="ui-button ui-button--secondary mt-4 inline-flex w-full justify-center text-xs"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Home page</span>
            </Link>

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

            {agentScreenNav.length ? (
              <nav className="mt-6 space-y-1" aria-label="Agent screens">
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                  Agent screens
                </div>
                {agentScreenNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cx(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                      pathname === item.href
                        ? "border border-accent/20 bg-accent/10 text-foreground"
                        : "text-[var(--foreground-muted)] hover:bg-surface-strong/50",
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                    {pathname === item.href ? (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    ) : null}
                  </Link>
                ))}
              </nav>
            ) : null}

            <div className="mt-6 border-t border-border pt-4">
              <AccountPanel
                isLoadingUser={isLoadingUser}
                isSigningOut={isSigningOut}
                onNavigate={() => setOpen(false)}
                onSignOut={handleSignOut}
                userEmail={userEmail}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AccountPanel({
  isLoadingUser,
  isSigningOut,
  onNavigate,
  onSignOut,
  userEmail,
}: {
  isLoadingUser: boolean;
  isSigningOut: boolean;
  onNavigate?: () => void;
  onSignOut: () => void;
  userEmail: string | null;
}) {
  if (isLoadingUser) {
    return (
      <div className="rounded-xl border border-border bg-surface/40 p-3">
        <div className="h-4 w-24 animate-pulse rounded bg-border/50" />
        <div className="mt-3 h-9 w-full animate-pulse rounded-full bg-border/30" />
      </div>
    );
  }

  if (!userEmail) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="ui-button ui-button--primary inline-flex w-full justify-center"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span>Log in</span>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong text-xs font-bold">
          {userEmail.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Account
          </div>
          <p className="truncate text-xs text-[var(--foreground-muted)]">
            {userEmail}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        disabled={isSigningOut}
        className="ui-button ui-button--secondary mt-3 inline-flex w-full justify-center text-xs disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
      </button>
    </div>
  );
}
