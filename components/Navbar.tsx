"use client";

import Link from "next/link";

export default function Navbar() {
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
          <Link href="/#features" className="transition hover:text-white">
            Features
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/billing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/agents" className="transition hover:text-white">
            Agents
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
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
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 md:hidden">
          <Link
            href="/login"
            className="rounded-full border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:text-emerald-300"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
