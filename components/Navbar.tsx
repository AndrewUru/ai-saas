"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Nuevo import para UX de estado activo
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Iconos sencillos (SVG) para mejorar la UX visual sin instalar librerías extra
const Icons = {
  SignOut: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),

  User: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
};

type NavLink = {
  href: string;
  label: string;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/academy", label: "Academy" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
];

export default function Navbar() {
  const pathname = usePathname(); // Hook para saber la ruta actual
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoadingUser(false);
      return;
    }

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
      }
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await supabase?.auth.signOut();
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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* LOGO AREA */}
        <Link
          href="/"
          className="group flex items-center transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo.svg"
            alt="AICommerce"
            width={120} // controla aquí el tamaño
            height={32} // proporcional al SVG original
            className="object-contain"
            priority
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-1 rounded-full bg-slate-900/40 px-2 py-1.5 shadow-inner shadow-white/5 md:flex">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-emerald-300"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-3/4 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ACTIONS AREA */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoadingUser ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-slate-800" />
          ) : isLoggedIn ? (
            <div className="group relative flex items-center gap-3">
              {/* User Capsule */}
              <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 pl-1 pr-3 py-1 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:bg-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-[10px] font-bold text-slate-950 shadow-sm">
                  {userEmail?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{userEmail}</span>
              </div>

              {/* Sign Out Button (Minimalist) */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-transparent text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icons.SignOut />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:text-amber-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                Start for free
              </Link>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <div className="md:hidden">
          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/50 text-slate-300 transition active:scale-95"
          >
            <div className="relative h-4 w-5 overflow-hidden">
              <span
                className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${
                  isMenuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />

              <span
                className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-all duration-300 ${
                  isMenuOpen
                    ? "-translate-x-full opacity-0"
                    : "translate-x-0 opacity-100"
                }`}
              />

              <span
                className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${
                  isMenuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`border-b border-slate-800 bg-slate-950 md:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="space-y-1 px-4 py-4">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-4">
          {isLoadingUser ? (
            <div className="h-12 w-full animate-pulse rounded-lg bg-slate-800" />
          ) : isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold">
                  {userEmail?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {userEmail}
                  </p>
                  <p className="text-xs text-emerald-400">Sesión iniciada</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-300 transition active:scale-95 disabled:opacity-50"
              >
                <Icons.SignOut />
                {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full justify-center rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition active:scale-95"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full justify-center rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/20 transition active:scale-95"
              >
                Start for free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
