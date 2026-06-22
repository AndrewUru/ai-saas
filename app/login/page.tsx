// app/login/page.tsx
"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const signInGoogle = async () => {
    setStatus({ intent: "info", message: "Redirecting to Google..." });

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

    const redirectUrl = `${origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      setStatus({ intent: "error", message: error.message });
    }
  };

  const statusClassName =
    status?.intent === "success"
      ? "ui-alert ui-alert--success"
      : status?.intent === "error"
        ? "ui-alert ui-alert--error"
        : "ui-alert border-border bg-[var(--surface)] text-foreground";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 text-foreground">
      <section className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="AI SaaS home">
            <Image
              src="/logo.svg"
              alt="AICommerce"
              width={132}
              height={36}
              priority
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <div className="ui-card p-6">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              Access your dashboard.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-full border border-border bg-[var(--surface)] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setAuthMode("magic")}
              className={`rounded-full px-3 py-2 transition ${
                authMode === "magic"
                  ? "bg-accent text-black"
                  : "text-[var(--foreground-muted)] hover:text-foreground"
              }`}
              aria-pressed={authMode === "magic"}
            >
              Magic link
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("password")}
              className={`rounded-full px-3 py-2 transition ${
                authMode === "password"
                  ? "bg-accent text-black"
                  : "text-[var(--foreground-muted)] hover:text-foreground"
              }`}
              aria-pressed={authMode === "password"}
            >
              Password
            </button>
          </div>

          <div className="mt-6">
            {authMode === "magic" ? (
              <form onSubmit={signInEmail} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email-magic"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email-magic"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@store.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="ui-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ui-button ui-button--primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send magic link"}
                </button>
              </form>
            ) : (
              <form onSubmit={signInPassword} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email-password"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@store.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="ui-input"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="ui-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ui-button ui-button--primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
            <span className="h-px flex-1 bg-border" />
            Or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={signInGoogle}
            className="ui-button ui-button--secondary w-full"
          >
            <Image
              src="/google.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
              aria-hidden="true"
            />
            Continue with Google
          </button>

          {status && (
            <p
              className={`${statusClassName} mt-5`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[var(--foreground-muted)]">
            <Link
              href="/signup"
              className="font-medium text-accent hover:text-accent-strong"
            >
              Create account
            </Link>
            <span className="h-1 w-1 rounded-full bg-border" />
            <Link href="/contact" className="font-medium hover:text-foreground">
              Need help?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
