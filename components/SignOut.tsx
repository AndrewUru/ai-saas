"use client";
import Link from "next/link";

export function SignOutButton() {
  return (
    <Link
      href="/logout"
      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08]"
      data-oid=":u5wqnx"
    >
      Cerrar sesión
    </Link>
  );
}
