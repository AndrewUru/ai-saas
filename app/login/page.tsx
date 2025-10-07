// app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status =
  | {
      intent: "info" | "success" | "error";
      message: string;
    }
  | null;

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const signInEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ intent: "info", message: "Sending your magic link..." });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      setStatus({
        intent: "success",
        message: "Check your inbox to finish signing in.",
      });
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : "Unexpected error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInGoogle = async () => {
    setStatus({ intent: "info", message: "Redirecting to Google..." });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus({ intent: "error", message: error.message });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.20),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 md:flex-row md:items-stretch md:gap-16 md:px-10 lg:px-16">
        <section className="flex flex-1 flex-col justify-center space-y-6 text-center md:text-left">
          <p className="inline-flex items-center gap-2 self-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300 md:self-start">
            Secure access
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Sign in to orchestrate every AI agent from one command center
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Manage conversations, billing, and WooCommerce integrations in one
            dashboard. Your credentials stay encrypted on our servers, never in
            the browser.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            {[
              "Email magic links with zero password maintenance.",
              "OAuth sign in with enterprise compliant Google accounts.",
              "Server side Supabase sessions keep every request scoped to you.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-300">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 8.5L6.5 11L12 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
          <div className="mb-6 space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-slate-400">
              Use your work email or single sign-on to continue.
            </p>
          </div>

          <form onSubmit={signInEmail} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@store.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending magic link..." : "Send me a magic link"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            Or continue with
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            onClick={signInGoogle}
            className="w-full rounded-full border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-emerald-200"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            Trouble signing in?{" "}
            <a href="/contact" className="text-emerald-300 hover:text-emerald-200">
              Contact support
            </a>
          </p>

          {status && (
            <p
              className={[
                "mt-6 rounded-2xl border px-4 py-3 text-sm",
                status.intent === "success" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                status.intent === "error" && "border-rose-500/40 bg-rose-500/10 text-rose-200",
                status.intent === "info" && "border-slate-700 bg-slate-900/70 text-slate-200",
              ]
                .filter(Boolean)
                .join(" ")}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
