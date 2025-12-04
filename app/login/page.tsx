// app/login/page.tsx
"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = {
  intent: "info" | "success" | "error";
  message: string;
} | null;

type AuthMode = "magic" | "password";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("magic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  // --- MAGIC LINK ----------------------------------------------------------
  const signInEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ intent: "info", message: "Sending your magic link..." });

    try {
      const redirectUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
      }/auth/callback?next=/dashboard`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
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

  // --- EMAIL + PASSWORD ----------------------------------------------------
  const signInPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ intent: "info", message: "Checking your credentials..." });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      setStatus({
        intent: "success",
        message: "Logged in. Redirecting to your dashboard...",
      });

      router.push("/dashboard");
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : "Unexpected error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- GOOGLE OAUTH --------------------------------------------------------
  const signInGoogle = async () => {
    setStatus({ intent: "info", message: "Redirecting to Google..." });
    const redirectUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    }/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      setStatus({ intent: "error", message: error.message });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.20),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 md:flex-row md:items-stretch md:gap-16 md:px-10 lg:px-16">
        {/* LEFT TEXT COLUMN */}
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
              "Email + password for teams that prefer classic logins.",
              "OAuth sign in with enterprise compliant Google accounts.",
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

        {/* RIGHT CARD */}
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
          <div className="mb-6 space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-slate-400">
              Use your work email, password or single sign-on to continue.
            </p>
          </div>

          {/* Toggle Magic link / Password */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-slate-900 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setAuthMode("magic")}
              className={`rounded-full px-3 py-2 ${
                authMode === "magic"
                  ? "bg-slate-800 text-emerald-300"
                  : "text-slate-400"
              }`}
            >
              Magic link
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("password")}
              className={`rounded-full px-3 py-2 ${
                authMode === "password"
                  ? "bg-slate-800 text-emerald-300"
                  : "text-slate-400"
              }`}
            >
              Email + password
            </button>
          </div>

          {/* FORM SEGÚN MODO */}
          {authMode === "magic" ? (
            <form onSubmit={signInEmail} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email-magic"
                  className="text-sm font-medium text-slate-200"
                >
                  Work email
                </label>
                <input
                  id="email-magic"
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
                {isSubmitting
                  ? "Sending magic link..."
                  : "Send me a magic link"}
              </button>
            </form>
          ) : (
            <form onSubmit={signInPassword} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email-password"
                  className="text-sm font-medium text-slate-200"
                >
                  Work email
                </label>
                <input
                  id="email-password"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@store.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          <div className="my-6 flex items-center gap-4 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            Or continue with
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="mt-6">
            <button
              onClick={signInGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition"
            >
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Continuar con Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Trouble signing in?{" "}
            <a
              href="/contact"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Contact support
            </a>
          </p>

          <p className="mt-2 text-center text-xs text-slate-500">
            ¿Aún no tienes cuenta?{" "}
            <a
              href="/signup"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Crea una ahora
            </a>
          </p>

          {status && (
            <p
              className={[
                "mt-6 rounded-2xl border px-4 py-3 text-sm",
                status.intent === "success" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                status.intent === "error" &&
                  "border-rose-500/40 bg-rose-500/10 text-rose-200",
                status.intent === "info" &&
                  "border-slate-700 bg-slate-900/70 text-slate-200",
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
