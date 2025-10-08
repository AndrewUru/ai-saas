"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavLink = {
  href: string;
  label: string;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/#features", label: "Features" },
  { href: "/agents", label: "Agents", requiresAuth: true },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/billing", label: "Billing", requiresAuth: true },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      },
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [supabase]);
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      setUserEmail(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out", error);
      setIsSigningOut(false);
    }
  };

  const isLoggedIn = Boolean(userEmail);

  const filteredLinks = NAV_LINKS.filter((link) => {
    if (link.requiresAuth && !isLoggedIn) return false;
    if (link.hideWhenAuth && isLoggedIn) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-widest text-emerald-300"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-base font-bold">
            AI
          </span>
          <span>Commerce Agents</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLoadingUser ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-800/70" />
          ) : isLoggedIn ? (
            <>
              <span className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
                  {userEmail?.[0]?.toUpperCase()}
                </span>
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningOut ? "Saliendo..." : "Cerrar sesion"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-emerald-300"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Start for free
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar navegacion" : "Abrir navegacion"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/70 text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
          >
            <span className="relative h-4 w-4">
              <span
                className={`absolute left-0 block h-0.5 w-full transform rounded-full bg-current transition duration-200 ease-out ${
                  isMenuOpen ? "top-2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute top-1.5 left-0 block h-0.5 w-full transform rounded-full bg-current transition duration-200 ease-out ${
                  isMenuOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-full transform rounded-full bg-current transition duration-200 ease-out ${
                  isMenuOpen ? "top-2 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden transition-[max-height,opacity] duration-300 ease-out`}
      >
        <div className="space-y-6 border-t border-slate-800 bg-slate-950/95 px-4 py-6">
          <div className="flex flex-col gap-4 text-sm font-medium text-slate-200">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl border border-transparent px-3 py-2 transition hover:border-emerald-400/30 hover:text-emerald-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-4 text-sm">
            {isLoadingUser ? (
              <div className="h-10 w-full animate-pulse rounded-full bg-slate-800/70" />
            ) : isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-200">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-semibold text-emerald-200">
                    {userEmail?.[0]?.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Sesion activa
                    </p>
                    <p className="text-sm font-medium">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningOut ? "Saliendo..." : "Cerrar sesion"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-full border border-slate-700 px-4 py-2 text-center text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-emerald-300"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-full bg-emerald-400 px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
