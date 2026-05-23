import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex h-screen min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">
          AI SaaS
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in to continue to your dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-800 px-5 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
